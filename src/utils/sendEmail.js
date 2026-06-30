import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─────────────────────────────────────────
// Base send function
// ─────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// ─────────────────────────────────────────
// OTP Email
// ─────────────────────────────────────────
export const sendOTPEmail = async (email, otp, purpose) => {
  const purposeText = {
    register: 'নিবন্ধন যাচাই',
    'reset-password': 'পাসওয়ার্ড রিসেট',
    login: 'লগইন যাচাই',
  };

  await sendEmail({
    to: email,
    subject: `Ruposhi — আপনার OTP কোড`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #C8956C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">RUPOSHI</h1>
          <p style="color: #FDF6EE; margin: 5px 0;">Grace in Every Thread</p>
        </div>
        <div style="padding: 30px; background: #FDF6EE;">
          <h2 style="color: #2C1810;">${purposeText[purpose] || 'যাচাইকরণ'}</h2>
          <p style="color: #7A5C4F;">আপনার OTP কোড:</p>
          <div style="background: #fff; border: 2px solid #C8956C; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #C8956C; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #7A5C4F;">এই কোডটি <strong>${process.env.OTP_EXPIRE_MINUTES || 5} মিনিট</strong> পর্যন্ত বৈধ।</p>
          <p style="color: #7A5C4F; font-size: 12px;">যদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
        </div>
      </div>
    `,
  });
};

// ─────────────────────────────────────────
// Order Confirmation Email
// ─────────────────────────────────────────
export const sendOrderConfirmationEmail = async (email, order) => {
  await sendEmail({
    to: email,
    subject: `Ruposhi — অর্ডার নিশ্চিত হয়েছে #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #C8956C; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">RUPOSHI</h1>
        </div>
        <div style="padding: 30px; background: #FDF6EE;">
          <h2 style="color: #2C1810;">আপনার অর্ডার নিশ্চিত হয়েছে!</h2>
          <p style="color: #7A5C4F;">অর্ডার নম্বর: <strong>#${order.orderNumber}</strong></p>
          <p style="color: #7A5C4F;">মোট পরিমাণ: <strong>৳${order.totalAmount}</strong></p>
          <p style="color: #7A5C4F;">পেমেন্ট পদ্ধতি: <strong>${order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'}</strong></p>
          <p style="color: #7A5C4F;">ধন্যবাদ Ruposhi তে কেনাকাটা করার জন্য!</p>
        </div>
      </div>
    `,
  });
};

// ─────────────────────────────────────────
// Password Reset Email
// ─────────────────────────────────────────
export const sendPasswordResetEmail = async (email, otp) => {
  await sendOTPEmail(email, otp, 'reset-password');
};

export default sendEmail;
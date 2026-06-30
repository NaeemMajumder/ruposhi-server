import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendOTPSMS = async (phone, otp) => {
  await client.messages.create({
    body: `Ruposhi OTP: ${otp}. এই কোডটি ${process.env.OTP_EXPIRE_MINUTES || 5} মিনিট বৈধ। কাউকে শেয়ার করবেন না।`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

export default sendOTPSMS;
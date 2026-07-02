import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ─────────────────────────────────────────
// Format BD Phone Number
// ─────────────────────────────────────────
const formatPhone = (phone) => {
  if (phone.startsWith('01')) return `+88${phone}`;
  if (phone.startsWith('8801')) return `+${phone}`;
  return phone;
};

// ─────────────────────────────────────────
// Send OTP via Twilio Verify
// ─────────────────────────────────────────
export const sendOTPSMS = async (phone, otp) => {
  const formattedPhone = formatPhone(phone);

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      });

    console.log(`✅ SMS OTP sent to ${formattedPhone}: ${verification.status}`);
    return verification;
  } catch (error) {
    console.error('❌ SMS Error:', error.message);
    throw new Error('SMS sending failed');
  }
};

// ─────────────────────────────────────────
// Verify OTP via Twilio Verify
// ─────────────────────────────────────────
export const verifyOTPSMS = async (phone, otp) => {
  const formattedPhone = formatPhone(phone);

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      });

    return verificationCheck.status === 'approved';
  } catch (error) {
    console.error('❌ SMS Verify Error:', error.message);
    throw new Error('OTP verification failed');
  }
};

export default sendOTPSMS;
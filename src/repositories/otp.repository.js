import OTP from '../models/OTP.model.js';

const otpRepository = {
  create: async (data) => {
    // Delete existing OTP for same contact + purpose
    await OTP.deleteMany({ contact: data.contact, purpose: data.purpose });
    return await OTP.create(data);
  },

  findValid: async (contact, purpose) => {
    return await OTP.findOne({
      contact,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  },

  incrementAttempts: async (id) => {
    return await OTP.findByIdAndUpdate(
      id,
      { $inc: { attempts: 1 } },
      { new: true }
    );
  },

  markAsUsed: async (id) => {
    return await OTP.findByIdAndUpdate(id, { isUsed: true }, { new: true });
  },

  deleteByContact: async (contact, purpose) => {
    return await OTP.deleteMany({ contact, purpose });
  },
};

export default otpRepository;
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Multer — Memory Storage
// ─────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPG, PNG, WebP images are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
});

// ─────────────────────────────────────────
// Upload to Cloudinary
// ─────────────────────────────────────────
export const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `ruposhi/${folder}`,
      resource_type: 'image',
      // ❌ upload_preset remove করো — Signed preset এ লাগে না
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'webp' },
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Upload Error:', error);
          return reject(new AppError(`Image upload failed: ${error.message}`, 500));
        }
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ─────────────────────────────────────────
// Delete from Cloudinary
// ─────────────────────────────────────────
export const deleteFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id);
};
import testimonialRepository from "../repositories/testimonial.repository.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middleware/upload.middleware.js";
import AppError from "../utils/AppError.js";

// ─────────────────────────────────────────
// Get Active Testimonials (Public)
// ─────────────────────────────────────────
const getActiveTestimonials = async (limit) => {
  return await testimonialRepository.findActive(limit);
};

// ─────────────────────────────────────────
// Get All Testimonials (Admin)
// ─────────────────────────────────────────
const getAllTestimonials = async () => {
  return await testimonialRepository.findAll();
};

// ─────────────────────────────────────────
// Create Testimonial (Admin)
// ─────────────────────────────────────────
const createTestimonial = async (data, file) => {
  if (file) {
    const result = await uploadToCloudinary(file.buffer, "testimonials", {
      width: 200,
      height: 200,
      crop: "fill",
    });
    data.avatar = result;
  }

  return await testimonialRepository.create(data);
};

// ─────────────────────────────────────────
// Update Testimonial (Admin)
// ─────────────────────────────────────────
const updateTestimonial = async (id, data, file) => {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw new AppError("Testimonial not found", 404);

  if (file) {
    if (testimonial.avatar?.public_id) {
      await deleteFromCloudinary(testimonial.avatar.public_id);
    }
    const result = await uploadToCloudinary(file.buffer, "testimonials", {
      width: 200,
      height: 200,
      crop: "fill",
    });
    data.avatar = result;
  }

  return await testimonialRepository.updateById(id, data);
};

// ─────────────────────────────────────────
// Delete Testimonial (Admin)
// ─────────────────────────────────────────
const deleteTestimonial = async (id) => {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw new AppError("Testimonial not found", 404);

  if (testimonial.avatar?.public_id) {
    await deleteFromCloudinary(testimonial.avatar.public_id);
  }

  await testimonialRepository.deleteById(id);
  return { message: "Testimonial deleted successfully" };
};

// ─────────────────────────────────────────
// Toggle Active (Admin)
// ─────────────────────────────────────────
const toggleTestimonial = async (id) => {
  const testimonial = await testimonialRepository.findById(id);
  if (!testimonial) throw new AppError("Testimonial not found", 404);

  const updated = await testimonialRepository.toggleActive(
    id,
    !testimonial.isActive,
  );

  return {
    testimonial: updated,
    message: updated.isActive
      ? "Testimonial activated"
      : "Testimonial deactivated",
  };
};

const testimonialService = {
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonial,
};

export default testimonialService;

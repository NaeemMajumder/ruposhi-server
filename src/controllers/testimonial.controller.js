import testimonialService from '../services/testimonial.service.js';
import catchAsync from '../utils/catchAsync.js';

// ─────────────────────────────────────────
// Get Active Testimonials (Public)
// ─────────────────────────────────────────
export const getActiveTestimonials = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const testimonials = await testimonialService.getActiveTestimonials(limit);
  res.status(200).json({
    success: true,
    data: { testimonials },
  });
});

// ─────────────────────────────────────────
// Get All Testimonials (Admin)
// ─────────────────────────────────────────
export const getAllTestimonials = catchAsync(async (req, res) => {
  const testimonials = await testimonialService.getAllTestimonials();
  res.status(200).json({
    success: true,
    data: { testimonials },
  });
});

// ─────────────────────────────────────────
// Create Testimonial (Admin)
// ─────────────────────────────────────────
export const createTestimonial = catchAsync(async (req, res) => {
  const data = { ...req.body };

  // Parse number
  if (data.rating) data.rating = Number(data.rating);
  if (data.sortOrder) data.sortOrder = Number(data.sortOrder);

  // Parse boolean
  if (data.isActive !== undefined) {
    data.isActive = data.isActive === 'true' || data.isActive === true;
  }

  const testimonial = await testimonialService.createTestimonial(
    data,
    req.file
  );

  res.status(201).json({
    success: true,
    message: 'Testimonial created successfully',
    data: { testimonial },
  });
});

// ─────────────────────────────────────────
// Update Testimonial (Admin)
// ─────────────────────────────────────────
export const updateTestimonial = catchAsync(async (req, res) => {
  const data = { ...req.body };

  if (data.rating) data.rating = Number(data.rating);
  if (data.sortOrder) data.sortOrder = Number(data.sortOrder);
  if (data.isActive !== undefined) {
    data.isActive = data.isActive === 'true' || data.isActive === true;
  }

  const testimonial = await testimonialService.updateTestimonial(
    req.params.id,
    data,
    req.file
  );

  res.status(200).json({
    success: true,
    message: 'Testimonial updated successfully',
    data: { testimonial },
  });
});

// ─────────────────────────────────────────
// Delete Testimonial (Admin)
// ─────────────────────────────────────────
export const deleteTestimonial = catchAsync(async (req, res) => {
  const result = await testimonialService.deleteTestimonial(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Toggle Active (Admin)
// ─────────────────────────────────────────
export const toggleTestimonial = catchAsync(async (req, res) => {
  const result = await testimonialService.toggleTestimonial(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: { testimonial: result.testimonial },
  });
});
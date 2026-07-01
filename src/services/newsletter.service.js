import newsletterRepository from '../repositories/newsletter.repository.js';
import AppError from '../utils/AppError.js';

// ─────────────────────────────────────────
// Subscribe
// ─────────────────────────────────────────
const subscribe = async (email, source = 'homepage') => {
  const existing = await newsletterRepository.findByEmail(email);

  if (existing) {
    // Already subscribed
    if (existing.isActive) {
      throw new AppError('এই email দিয়ে আগেই subscribe করা আছে', 400);
    }

    // Re-subscribe
    const updated = await newsletterRepository.updateById(existing._id, {
      isActive: true,
      subscribedAt: new Date(),
      unsubscribedAt: null,
      source,
    });

    return {
      subscriber: updated,
      message: 'আপনাকে আবার স্বাগতম! Successfully re-subscribed।',
    };
  }

  const subscriber = await newsletterRepository.create({
    email,
    source,
    isActive: true,
    subscribedAt: new Date(),
  });

  return {
    subscriber,
    message: 'সফলভাবে subscribe করা হয়েছে। ধন্যবাদ!',
  };
};

// ─────────────────────────────────────────
// Unsubscribe
// ─────────────────────────────────────────
const unsubscribe = async (email) => {
  const subscriber = await newsletterRepository.findByEmail(email);

  if (!subscriber) {
    throw new AppError('এই email দিয়ে কোনো subscription নেই', 404);
  }

  if (!subscriber.isActive) {
    throw new AppError('এই email আগেই unsubscribe করা হয়েছে', 400);
  }

  await newsletterRepository.unsubscribe(email);

  return { message: 'সফলভাবে unsubscribe করা হয়েছে।' };
};

// ─────────────────────────────────────────
// Get All Subscribers (Admin)
// ─────────────────────────────────────────
const getAllSubscribers = async (queryString) => {
  const filter = {};

  if (queryString.isActive !== undefined) {
    filter.isActive = queryString.isActive === 'true';
  }

  if (queryString.source) {
    filter.source = queryString.source;
  }

  if (queryString.search) {
    filter.email = { $regex: queryString.search, $options: 'i' };
  }

  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;

  const { subscribers, total } = await newsletterRepository.findAll(
    filter,
    { page, limit }
  );

  const activeCount = await newsletterRepository.countActive();

  return {
    subscribers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalActive: activeCount,
      totalAll: total,
    },
  };
};

// ─────────────────────────────────────────
// Delete Subscriber (Admin)
// ─────────────────────────────────────────
const deleteSubscriber = async (id) => {
  const subscriber = await newsletterRepository.findAll({ _id: id });
  if (!subscriber) throw new AppError('Subscriber not found', 404);

  await newsletterRepository.deleteById(id);
  return { message: 'Subscriber deleted successfully' };
};

const newsletterService = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
};

export default newsletterService;
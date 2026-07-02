import productService from "../services/product.service.js";
import catchAsync from "../utils/catchAsync.js";

// ─────────────────────────────────────────
// YouTube URL থেকে Video ID extract
// ─────────────────────────────────────────
const extractYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// ─────────────────────────────────────────
// YouTube Title Auto Fetch
// ─────────────────────────────────────────
const fetchYouTubeTitle = async (videoId) => {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    const data = await response.json();
    return data.title || null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────
// Get All Products
// ─────────────────────────────────────────
export const getAllProducts = catchAsync(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Get Product by Slug
// ─────────────────────────────────────────
export const getProductBySlug = catchAsync(async (req, res) => {
  const result = await productService.getProductBySlug(req.params.slug);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// ─────────────────────────────────────────
// Get Featured Products
// ─────────────────────────────────────────
export const getFeaturedProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getFeaturedProducts(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Get New Arrivals
// ─────────────────────────────────────────
export const getNewArrivals = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getNewArrivals(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Get Flash Sale Products
// ─────────────────────────────────────────
export const getFlashSaleProducts = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  const products = await productService.getFlashSaleProducts(limit);
  res.status(200).json({
    success: true,
    data: { products },
  });
});

// ─────────────────────────────────────────
// Create Product (Admin)
// ─────────────────────────────────────────
export const createProduct = catchAsync(async (req, res) => {
  const data = { ...req.body };

  // Array parse
  if (data.sizes && typeof data.sizes === "string") {
    try {
      data.sizes = JSON.parse(data.sizes);
    } catch {
      data.sizes = [data.sizes];
    }
  }
  if (data.colors && typeof data.colors === "string") {
    try {
      data.colors = JSON.parse(data.colors);
    } catch {
      data.colors = [data.colors];
    }
  }
  if (data.tags && typeof data.tags === "string") {
    try {
      data.tags = JSON.parse(data.tags);
    } catch {
      data.tags = [data.tags];
    }
  }
  // ✅ YouTube URL parse — createProduct এ
  if (data.youtubeUrl) {
    const videoId = extractYouTubeId(data.youtubeUrl);
    if (videoId) {
      const title = await fetchYouTubeTitle(videoId);
      data.youtubeVideo = {
        url: data.youtubeUrl,
        videoId,
        title,
        addedAt: new Date(),
      };
    }
    delete data.youtubeUrl;
  }

  // Number parse
  if (data.price) data.price = Number(data.price);
  if (data.discountPrice) data.discountPrice = Number(data.discountPrice);
  if (data.stock) data.stock = Number(data.stock);

  // ✅ Slug manually generate করো
  const hasBengali = /[\u0980-\u09FF]/.test(data.name || "");
  if (hasBengali) {
    const timestamp = Date.now().toString().slice(-6);
    data.slug = `product-${timestamp}`;
  } else {
    const { default: slugify } = await import("slugify");
    data.slug = slugify(data.name || "", { lower: true, strict: true });
  }

  const product = await productService.createProduct(data, req.files);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: { product },
  });
});

// ─────────────────────────────────────────
// Update Product (Admin)
// ─────────────────────────────────────────
export const updateProduct = catchAsync(async (req, res) => {
  const data = { ...req.body }; // ✅ data define করো

  // YouTube URL parse
  if (data.youtubeUrl) {
    const videoId = extractYouTubeId(data.youtubeUrl);
    if (videoId) {
      const title = await fetchYouTubeTitle(videoId);
      data.youtubeVideo = {
        url: data.youtubeUrl,
        videoId,
        title,
        addedAt: new Date(),
      };
    }
    delete data.youtubeUrl;
  }

  const product = await productService.updateProduct(
    req.params.id,
    data, // ✅ req.body এর বদলে data দাও
    req.files,
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: { product },
  });
});

// ─────────────────────────────────────────
// Delete Product (Admin)
// ─────────────────────────────────────────
export const deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// ─────────────────────────────────────────
// Delete Product Image (Admin)
// ─────────────────────────────────────────
export const deleteProductImage = catchAsync(async (req, res) => {
  const product = await productService.deleteProductImage(
    req.params.id,
    req.body.publicId,
  );
  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: { product },
  });
});

// ─────────────────────────────────────────
// Update Product Video
// ─────────────────────────────────────────
export const updateProductVideo = catchAsync(async (req, res) => {
  const { youtubeUrl } = req.body;

  if (!youtubeUrl) {
    return res.status(400).json({
      success: false,
      message: "YouTube URL is required",
    });
  }

  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid YouTube URL",
    });
  }

  const title = await fetchYouTubeTitle(videoId);

  const product = await productService.updateVideo(req.params.id, {
    url: youtubeUrl,
    videoId,
    title,
    addedAt: new Date(),
  });

  res.status(200).json({
    success: true,
    message: "Video updated successfully",
    data: { product },
  });
});

// ─────────────────────────────────────────
// Remove Product Video
// ─────────────────────────────────────────
export const removeProductVideo = catchAsync(async (req, res) => {
  const product = await productService.removeVideo(req.params.id);

  res.status(200).json({
    success: true,
    message: "Video removed successfully",
    data: { product },
  });
});

// ─────────────────────────────────────────
// Bulk Add Video → Multiple Products
// ─────────────────────────────────────────
export const bulkAddVideo = catchAsync(async (req, res) => {
  const { youtubeUrl, productIds } = req.body;

  if (!youtubeUrl || !productIds?.length) {
    return res.status(400).json({
      success: false,
      message: "YouTube URL and product IDs are required",
    });
  }

  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid YouTube URL",
    });
  }

  const title = await fetchYouTubeTitle(videoId);

  const result = await productService.bulkAddVideo(productIds, {
    url: youtubeUrl,
    videoId,
    title,
    addedAt: new Date(),
  });

  res.status(200).json({
    success: true,
    message: `Video added to ${result.modifiedCount} products`,
    data: { modifiedCount: result.modifiedCount },
  });
});

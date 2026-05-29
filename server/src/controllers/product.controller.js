import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// ─────────────────────────────────────────────────────────────────────────────
// LIST PRODUCT (Create)
// Seller posts a new listing with up to 5 images
// Images are uploaded to Cloudinary via Multer (upload.array("images", 5))
// ─────────────────────────────────────────────────────────────────────────────
const listProduct = asyncHandler(async (req, res) => {
    const { title, description, price, category, condition, listingType, rentalPricePerDay } = req.body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!title || !price || !category) {
        throw new ApiError(400, "Title, price, and category are required");
    }

    // ── Validate rental-specific fields ───────────────────────────────────
    if (listingType === "rent" && !rentalPricePerDay) {
        throw new ApiError(400, "Rental price per day is required for rental listings");
    }

    // ── Handle image uploads ───────────────────────────────────────────────
    // req.files is set by upload.array("images", 5) middleware in routes
    // Each file has a .path property pointing to the temp file on disk
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "At least one product image is required");
    }

    // Upload all images to Cloudinary in parallel for speed
    const uploadPromises = req.files.map((file) =>
        uploadOnCloudinary(file.path, "campus_marketplace/products")
    );
    const uploadResults = await Promise.all(uploadPromises);

    // Extract URLs (shown to users) and public_ids (used to delete later)
    const images = uploadResults.map((r) => r.url);
    const imagePublicIds = uploadResults.map((r) => r.public_id);

    // ── Create product ────────────────────────────────────────────────────
    const product = await Product.create({
        title: title.trim(),
        description: description?.trim() || "",
        price: parseFloat(price),
        category,
        condition: condition || "good",
        listingType: listingType || "sell",
        rentalPricePerDay: listingType === "rent" ? parseFloat(rentalPricePerDay) : null,
        images,
        imagePublicIds,
        seller: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, { product }, "Product listed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PRODUCTS (Browse / Search)
// Public — no auth required
// Supports: search, category filter, condition filter, listingType filter,
//           price range, sort, pagination
// ─────────────────────────────────────────────────────────────────────────────
const getAllProducts = asyncHandler(async (req, res) => {
    const {
        search,         // Full-text search on title + description
        category,       // Filter by category
        condition,      // Filter by condition
        listingType,    // "sell" or "rent"
        minPrice,       // Price range minimum
        maxPrice,       // Price range maximum
        sort = "newest",// Sort order
        page = 1,
        limit = 12,     // 12 per page — good for a 3 or 4 column grid
    } = req.query;

    // ── Build filter object ────────────────────────────────────────────────
    const filter = { isSold: false }; // Never show sold items in browse

    // Full-text search — uses the { title: "text", description: "text" } index
    if (search) {
        filter.$text = { $search: search };
    }

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (listingType) filter.listingType = listingType;

    // Price range — only add if values are provided
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // ── Build sort object ──────────────────────────────────────────────────
    const sortOptions = {
        newest: { createdAt: -1 },      // Recently listed first
        oldest: { createdAt: 1 },
        "price-low": { price: 1 },      // Cheapest first
        "price-high": { price: -1 },    // Most expensive first
    };
    const sortQuery = sortOptions[sort] || sortOptions.newest;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Run count and data fetch in parallel — faster than sequential
    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate("seller", "username fullname avatar averageRating college")
            .sort(sortQuery)
            .skip(skip)
            .limit(parseInt(limit))
            .select("-imagePublicIds"), // Never send Cloudinary internal IDs to frontend
        Product.countDocuments(filter),
    ]);

    // Flag products that have a confirmed/pending order so frontend
    // can show "Deal in Progress" badge — product is still listed but
    // buyer should know someone is already negotiating
    const productIds = products.map(p => p._id);
    const activeOrders = await Order.find({
        product: { $in: productIds },
        status: { $in: ["pending", "confirmed"] },
    }).select("product status orderType rentalEndDate");

    const activeOrderMap = {};
    activeOrders.forEach(o => {
        // For rentals that are confirmed — check if rental period is still active
        // A rental is "currently rented" if confirmed AND rentalEndDate is in the future
        if (o.orderType === "rental" && o.status === "confirmed") {
            const isCurrentlyRented = o.rentalEndDate && new Date(o.rentalEndDate) > new Date();
            activeOrderMap[o.product.toString()] = isCurrentlyRented ? "rented" : "confirmed";
        } else {
            activeOrderMap[o.product.toString()] = o.status;
        }
    });

    const productsWithStatus = products.map(p => ({
        ...p.toObject(),
        activeOrderStatus: activeOrderMap[p._id.toString()] || null,
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products: productsWithStatus,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
                },
            },
            "Products fetched successfully"
        )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET SINGLE PRODUCT
// Public — shows full product detail with seller info
// ─────────────────────────────────────────────────────────────────────────────
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId)
        .populate("seller", "username fullname avatar averageRating totalRatings college phone")
        .select("-imagePublicIds");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PRODUCT
// Only the seller who created it can edit — verified by comparing seller field
// Cannot edit a sold product
// ─────────────────────────────────────────────────────────────────────────────
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId).select("+imagePublicIds");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Ownership check — only the seller can edit their listing
    if (product.seller.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to edit this listing");
    }

    // Don't allow editing a sold product — it's a closed transaction
    if (product.isSold) {
        throw new ApiError(400, "Cannot edit a sold product");
    }

    const { title, description, price, category, condition, listingType, rentalPricePerDay } = req.body;

    // Only update fields that were actually sent
    if (title) product.title = title.trim();
    if (description !== undefined) product.description = description.trim();
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (condition) product.condition = condition;
    if (listingType) product.listingType = listingType;
    if (rentalPricePerDay !== undefined) {
        product.rentalPricePerDay = listingType === "rent" ? parseFloat(rentalPricePerDay) : null;
    }

    await product.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { product }, "Product updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADD IMAGES TO PRODUCT
// Seller can add more images up to the 5-image limit
// ─────────────────────────────────────────────────────────────────────────────
const addProductImages = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId).select("+imagePublicIds");

    if (!product) throw new ApiError(404, "Product not found");

    if (product.seller.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No images provided");
    }

    // Check total images won't exceed limit
    if (product.images.length + req.files.length > 5) {
        throw new ApiError(400, `You can only have 5 images. You currently have ${product.images.length}.`);
    }

    // Upload new images
    const uploadPromises = req.files.map((f) =>
        uploadOnCloudinary(f.path, "campus_marketplace/products")
    );
    const results = await Promise.all(uploadPromises);

    // Push new URLs and public_ids into the existing arrays
    product.images.push(...results.map((r) => r.url));
    product.imagePublicIds.push(...results.map((r) => r.public_id));
    await product.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { images: product.images }, "Images added successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PRODUCT IMAGE
// Removes a single image by its index in the images array
// Deletes from Cloudinary and removes from both arrays
// ─────────────────────────────────────────────────────────────────────────────
const deleteProductImage = asyncHandler(async (req, res) => {
    const { imageIndex } = req.body; // Which image to delete (0-based index)

    const product = await Product.findById(req.params.productId).select("+imagePublicIds");

    if (!product) throw new ApiError(404, "Product not found");

    if (product.seller.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    if (imageIndex === undefined || imageIndex < 0 || imageIndex >= product.images.length) {
        throw new ApiError(400, "Invalid image index");
    }

    // Must keep at least 1 image on a listing
    if (product.images.length === 1) {
        throw new ApiError(400, "A product must have at least one image. Upload a new image before removing this one.");
    }

    // Delete from Cloudinary using the stored public_id
    await deleteFromCloudinary(product.imagePublicIds[imageIndex]);

    // Remove from both arrays at the same index
    product.images.splice(imageIndex, 1);
    product.imagePublicIds.splice(imageIndex, 1);
    await product.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { images: product.images }, "Image deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE PRODUCT (Soft Delete)
// Sets isDeleted:true — the pre-find hook hides it from all queries
// Cannot delete if there's a pending/confirmed order on the product
// ─────────────────────────────────────────────────────────────────────────────
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) throw new ApiError(404, "Product not found");

    if (product.seller.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this listing");
    }

    // Block deletion if there's an active order — seller has committed
    const activeOrder = await Order.findOne({
        product: product._id,
        status: { $in: ["pending", "confirmed"] },
    });

    if (activeOrder) {
        throw new ApiError(
            400,
            "Cannot delete a listing with an active order. Cancel the order first."
        );
    }

    // Soft delete — orders still reference this product._id safely
    product.isDeleted = true;
    await product.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Listing deleted successfully"));
});

export {
    listProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    addProductImages,
    deleteProductImage,
    deleteProduct,
};
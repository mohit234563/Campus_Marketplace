import { Router } from "express";
import {
    listProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    addProductImages,
    deleteProductImage,
    deleteProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ── Public routes — no auth needed 
router.get("/", getAllProducts);                         // Browse & search
router.get("/:productId", getProductById);              // Single product detail

// ── Protected routes — must be logged in 
router.use(verifyJWT);

// List a new product — upload.array handles up to 5 images from "images" field
router.post("/", upload.array("images", 5), listProduct);

router.patch("/:productId", updateProduct);             // Edit text fields
router.delete("/:productId", deleteProduct);            // Soft delete

// Image management
router.post("/:productId/images", upload.array("images", 5), addProductImages);
router.delete("/:productId/images", deleteProductImage);

export default router;
// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// Import our router renderers
import { getProducts, getCart, getCheckout, getIndex, getProductDetails } from "../controllers/shop";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", getIndex),
shopRoutes.get("/products", getProducts);
shopRoutes.get("/cart", getCart);
shopRoutes.get("/checkout", getCheckout);
shopRoutes.get("/product-details/:id", getProductDetails)

export default shopRoutes;
// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// Import our router renderers
import { getProducts } from "../controllers/products";
import { getCart, getCheckout, getShop } from "../controllers/shop";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", getShop),
shopRoutes.get("/products", getProducts);
shopRoutes.get("/cart", getCart);
shopRoutes.get("/checkout", getCheckout);

export default shopRoutes;
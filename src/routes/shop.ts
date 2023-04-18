// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// Import the products array from the admin file
import { getProducts } from "../controllers/products";
import { getCart } from "../controllers/shop";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", getProducts);
shopRoutes.get("/cart", getCart);

export default shopRoutes;
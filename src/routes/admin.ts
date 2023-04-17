// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
import { getAddProduct, postAddProduct } from "../controllers/products";

// Create our express router
const adminRoutes = express.Router();

// Initial middleware response
adminRoutes.get("/add-product", getAddProduct);

// Handle a response in the body of a request usng middleware
adminRoutes.post("/add-product", postAddProduct);

export default adminRoutes;
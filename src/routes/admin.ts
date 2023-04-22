// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
import { getAdminEditProduct } from "../controllers/products";
import { getAddProduct, postAddProduct, getProducts } from "../controllers/admin";

// Create our express router
const adminRoutes = express.Router();

// Handle and eventually render the admin/add-product page
adminRoutes.get("/add-product", getAddProduct);

// Handle the add-product request and then redirect to the shop page
adminRoutes.post("/add-product", postAddProduct);

// Handle and eventally render the admin/products page
adminRoutes.get("/products", getProducts);

// Handle the edit product dynamic route and render the admin/edit-products page
adminRoutes.get("/edit-product/:id", getAdminEditProduct);

export default adminRoutes;
/**
 * Author : Nothile Moyo
 * Date : 25/04/2023
 * License : MIT
 * 
 * Admin routing page, handles routing with the controller by the same name in the "src/controllers" folder
 * The isAuthenticated route used here checks if the user is logged in, and redirects the user if they aren't
 */

// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
import { getAdminEditProduct, getAddProduct, postAddProduct, getProducts, updateProductController, deleteProduct } from "../controllers/admin";
import isAuthenticated from "../middleware/is-auth";

// Create our express router
const adminRoutes = express.Router();

// Handle and eventually render the admin/add-product page
adminRoutes.get("/admin/add-product", isAuthenticated, getAddProduct);

// Handle the add-product request and then redirect to the shop page
adminRoutes.post("/admin/add-product", isAuthenticated, postAddProduct);

// Handle and eventally render the admin/products page
adminRoutes.get("/admin/products", isAuthenticated, getProducts);

// Handle the edit product dynamic route and render the admin/edit-products page
adminRoutes.get("/admin/edit-product/:id", isAuthenticated, getAdminEditProduct);

// Handle the update product dynamic route which updates the product in the JSON
adminRoutes.post("/admin/update-product/:id", isAuthenticated, updateProductController);

// Delete the item from the products json array based on the id
adminRoutes.post("/admin/delete-product/:id", isAuthenticated, deleteProduct);

export default adminRoutes;
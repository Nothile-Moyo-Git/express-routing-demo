// Import express router for the admin and shop pages
// This file is for the product routes
import express from "express";
// import path from "path";
// import rootDir from "../util/path";

// import our express types for TypeScript use
import { Request, Response, NextFunction } from 'express';

import { getAddProduct, postAddProduct } from "../controllers/products";

// Interface for our product types
interface Product {
    title : string
}

// Create our express router
const adminRoutes = express.Router();

const products : Product[] = [];

// Initial middleware response
adminRoutes.get("/add-product", getAddProduct);

// Handle a response in the body of a request usng middleware
adminRoutes.post("/add-product", postAddProduct);

export default adminRoutes;
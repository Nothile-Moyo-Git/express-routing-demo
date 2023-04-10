// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// Import the products array from the admin file
import { getProducts } from "../controllers/products";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", getProducts);

export default shopRoutes;
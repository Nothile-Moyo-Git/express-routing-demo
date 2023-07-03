// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";

// Import our router renderers
import { getCart, postCart, postOrderCreate, postCartDelete, getProducts, getCheckout, getIndex, getOrders, getProductDetails} from "../controllers/shop";

const shopRoutes = express.Router();

// Base middleware response, 
shopRoutes.get("/", getIndex),
shopRoutes.get("/cart", getCart);
shopRoutes.post("/cart", postCart);
shopRoutes.get("/orders", getOrders);
shopRoutes.get("/checkout", getCheckout);
shopRoutes.get("/products", getProducts);
shopRoutes.post("/cart-order-create", postOrderCreate);
shopRoutes.post("/cart-delete-item", postCartDelete);
shopRoutes.get("/product-detail/:id", getProductDetails);

export default shopRoutes;
// Import express router for the admin and shop pages
// This file is for the output routes
import express from "express";
import isAuthenticated from "../middleware/is-auth";

// Import our router renderers
import { getCart, postCart, postOrderCreate, postHandlePayment, getInvoiceController, postCartDelete, getProducts, getCheckout, getCheckoutSuccess, getIndex, getOrders, getProductDetails } from "../controllers/shop";

const shopRoutes = express.Router({ strict : true });

// Base middleware response, 
shopRoutes.get("/", getIndex),
shopRoutes.get("/cart", isAuthenticated, getCart);
shopRoutes.post("/cart", isAuthenticated, postCart);
shopRoutes.get("/orders", isAuthenticated, getOrders);
shopRoutes.get("/checkout", isAuthenticated, getCheckout);
shopRoutes.get("/checkout/success", isAuthenticated, getCheckoutSuccess);
shopRoutes.get("/checkout/cancel", isAuthenticated, getCheckout);
shopRoutes.post("/stripe_checkout", postHandlePayment);
shopRoutes.get("/products", getProducts);
shopRoutes.get("/order/:orderId", isAuthenticated, getInvoiceController);
shopRoutes.post("/cart-order-create", isAuthenticated, postOrderCreate);
shopRoutes.post("/cart-delete-item", isAuthenticated, postCartDelete);
shopRoutes.get("/product-detail/:id", getProductDetails);

export default shopRoutes;
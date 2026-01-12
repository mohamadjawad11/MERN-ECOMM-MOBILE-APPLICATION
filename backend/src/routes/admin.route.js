import { Router } from "express";
import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { updateOrderStatus,createProduct,updateProduct,getAllProducts,getDashboardStats,getAllCustomers} from "../controllers/admin.controller.js";


const router = Router();

router.use(protectRoute); //protect all admin routes
router.use(adminOnly); //allow only admin users

router.post("/products",upload.array("images", 3),createProduct);
router.get("/products",getAllProducts);
router.put("/products/:id",upload.array("images", 3),updateProduct); //put is used to completely update a resource

router.get("/orders",getAllOrders);
router.patch("/orders/:orderId/status",updateOrderStatus); //patch is used to partially update a resource like 1 attiribute

router.get("/customers",getAllCustomers);

router.get("/stats",getDashboardStats);

export default router;


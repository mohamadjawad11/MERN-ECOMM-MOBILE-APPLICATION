import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
export async function createOrder(req,res){
    try {
        const {user}=req;
        const {orderItems,shippingAddress,paymentResult,totalPrice}=req.body; // order details from body
        if(!orderItems || orderItems.length===0){
            return res.status(400).json({message:"No order items"});
        }
        //validate products and stock
        for(const item of orderItems){
            const product=await Product.findById(item.product._id);
            if(!product){
                return res.status(404).json({message:`Product with name ${product.name} not found`});
            }
            if(product.stock<item.quantity){
                return res.status(400).json({message:`Insufficient stock for product ${product.name}`});
            }
        }
//create order
const order=new Order({
    user:user._id,
    orderItems,
    shippingAddress,
    paymentResult,
    totalPrice,
});
//reduce stock atomically with stock check
for(const item of orderItems){
    const result = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
    );
    if (!result) {
        // Rollback previously decremented items or use transactions
        return res.status(400).json({ message: `Insufficient stock or product not found` });
    }
}
const createdOrder=await order.save();
        return res.status(201).json({message:"Order created successfully",order:createdOrder});
    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getUserOrders(req,res){
    try {
        const orders = await Order.find({ user: req.user._id }).populate("orderItems.product").sort({ createdAt: -1 });

        const orderWithReviewStatus = await Promise.all(orders.map(async (order) => {
            const review=await Review.findOne({orderId:order._id});
            return {
                ...order._doc,
                isReviewed:review ? true : false,
            };
        }));
        return res.status(200).json({orders:orderWithReviewStatus});
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
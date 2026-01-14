import { Order } from "../models/order.model.js";
import {Review} from "../models/review.model.js";
import Product from "../models/product.model.js"

export async function createReview(req,res){
    try {

        const user=req.user;
        const {productId,orderId,rating}=req.body;
        if(!productId || !orderId || !rating){
            return res.status(400).json({message:"Product ID, Order ID and rating are required"});
        }
        //validate rating
        if(rating<1 || rating>5){
            return res.status(400).json({message:"Rating must be between 1 and 5"});
        }
        //check if order exists
        const order=await Order.findById(orderId);
        if(!order){
            return res.status(404).json({message:"Order not found"});
        }
        //check if the order belongs to the user
        if(order.user.toString()!==user._id.toString()){
            return res.status(403).json({message:"You are not authorized to review this order"});
        }
        //check if the product is in the order
        const isProductInOrder=order.orderItems.some(item=>item.product.toString()===productId);
        if(!isProductInOrder){
            return res.status(400).json({message:"Product not found in the order"});
        }
        //check if order is delivered
        if(order.status!=="delivered"){
            return res.status(400).json({message:"Cannot review a product from an undelivered order"});
        }

        //update or create review
        const review = await Review.findOneAndUpdate(
      { productId, userId: user._id },
      { rating, orderId, productId, userId: user._id },
      { new: true, upsert: true, runValidators: true }
    );

    // update the product rating atomically using aggregation
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    
    const { avgRating = 0, count = 0 } = stats[0] || {};
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { averageRating: avgRating, totalReviews: count },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {      
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(201).json({ message: "Review submitted successfully", review });


    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
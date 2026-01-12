import cloudinary from "../config/cloudinary.js"
import Product from "../models/product.model.js";
import {Order} from "../models/order.model.js"
import { User } from "../models/user.model.js";

export async function createProduct(req, res) {
  try {
    // bring the data from req.body
    const { name, description, price, stock,category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }
    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maximum 3 images are allowed" });
    }
    //uploading images to cloudinary
    const uploadPromises=req.files.map((file)=>{
        return cloudinary.uploader.upload(file.path,{
            folder:"products",
        });
    })
    const uploadResults=await Promise.all(uploadPromises);
    //getting array of image urls to store in db
    const imageUrls=uploadResults.map((result)=>result.secure_url);
    //create product
    const product=await new Product({
        name,
        description,
        price:parseFloat(price),
        stock:parseInt(stock),
        category,
        images:imageUrls
    });
    await product.save();
    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllProducts(_,res){
    try {
        //-1 means in descending order
        const products=await Product.find().sortt({createdAt:-1});
        return res.status(200).json({products});
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function updateProduct(req,res){
    try {
        const {id}=req.params;
        const { name, description, price, stock,category } = req.body;
        const product=await Product.findById(id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(name) product.name=name;
        if(description) product.description=description;
        if(price) product.price=parseFloat(price);
        if(stock) product.stock=parseInt(stock);
        if(category) product.category=category;
        //handling images if any
        if(req.files && req.files.length>0){
            if(req.files.length>3){
                return res.status(400).json({ message: "Maximum 3 images are allowed" });
            }
            //uploading images to cloudinary
            const uploadPromises=req.files.map((file)=>{
                return cloudinary.uploader.upload(file.path,{
                    folder:"products",
                });
            })
            const uploadResults=await Promise.all(uploadPromises);
            product.images=uploadResults.map((result)=>result.secure_url);
            await product.save();
            return  res.status(200).json({ message: "Product updated successfully with new images", product });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getAllOrders(req,res){
    try {
        // populate means to fetch related user details along with orders
        const orders=await Order.find().populate("user","name email")
        .populate("orderItems.product")
        .sort({createdAt:-1});
        return res.status(200).json({orders});
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function updateOrderStatus(req,res){

    try {
        const {orderId}=req.params;
        const {status}=req.body; //new status will be send by admin in req body

        if(!["Pending","Shipped","Delivered"].includes(status)){
            return res.status(400).json({message:"Invalid status value"});
        }
        const order=await Order.findById(orderId);
        if(!order){
            return res.status(404).json({message:"Order not found"});
        }
        order.status=status;

        //if order is marked as shipped, set shippedAt date
        if(status=="shipped" && !order.shippedAt){
            order.shippedAt=new Date();
        }
        //if order is marked as delivered, set deliveredAt date
        if(status=="delivered" && !order.deliveredAt){
            order.deliveredAt=new Date();
        }
        await order.save();
        return res.status(200).json({message:"Order status updated successfully",order});
    } catch (error) {
        console.error("Error updating order status:", error);
        return res.status(500).json({ message: "Server error" });
    }
}   

export async function getAllCustomers(_,res){
    try {
        // populate means to fetch related user details along with orders
        const customers=await User.find().sort({createdAt:-1});
        return res.status(200).json({customers});
    } catch (error) {
        console.error("Error fetching customers:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getDashboardStats(_,res){
    try {
        const totalProducts=await Product.countDocuments();
        const totalOrders=await Order.countDocuments();
        const totalCustomers=await User.countDocuments();
        //calculate total revenue
        const orders=await Order.find();
        const totalRevenue=orders.reduce((acc,order)=>acc+order.totalPrice,0); // there is anothed method aggregate
        return res.status(200).json({
            totalProducts,
            totalOrders,
            totalCustomers,
            totalRevenue
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return res.status(500).json({ message: "Server error" });
    }   
}
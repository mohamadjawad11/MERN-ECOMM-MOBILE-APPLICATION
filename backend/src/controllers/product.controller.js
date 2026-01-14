import Product from "../models/product.model.js";

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

export async function getProductById(req,res){
    try {
        const {id}=req.params;
        const product=await Product.findById(id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }   
        return res.status(200).json({product});
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
import { User } from "../models/user.model.js";

export async function addAddress(req,res){
    try {
        const {label,fullName,streetAddress,city,state,zipCode,phoneNumber,isDefault}=req.body;
        if(!label || !fullName || !streetAddress || !city || !state || !zipCode || !phoneNumber){
            return res.status(400).json({message:"All fields are required"});
        }
        if(isDefault){
            User.addresses.forEach((addr)=>{
                addr.isDefault=false;
            });
        }
        User.addresses.push({
            label,
            fullName,
            streetAddress,
            city,
            state,
            zipCode,
            phoneNumber,
            isDefault:isDefault || false
        });
        await User.save();
        return res.status(201).json({message:"Address added successfully",addresses:User.addresses});
    } catch (error) {
        console.error("Error adding address:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getAddresses(req,res){
    try {
        return res.status(200).json({addresses:User.addresses});
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function updateAddress(req,res){
    try {
        const {label,fullName,streetAddress,city,state,zipCode,phoneNumber,isDefault}=req.body;
        const {addressId}=req.params;
        const address=User.addresses.id(addressId);
        if(!address){
            return res.status(404).json({message:"Address not found"});
        }
        if(isDefault){
            User.addresses.forEach((addr)=>{
                addr.isDefault=false;
            });
        }
        address.label=label || address.label;
        address.fullName=fullName || address.fullName;
        address.streetAddress=streetAddress || address.streetAddress;
        address.city=city || address.city;
        address.state=state || address.state;
        address.zipCode=zipCode || address.zipCode;
        address.phoneNumber=phoneNumber || address.phoneNumber;
        address.isDefault=isDefault !== undefined ? isDefault : address.isDefault;
        await User.save();
        return res.status(200).json({message:"Address updated successfully",addresses:User.addresses});
    } catch (error) {
        console.error("Error updating address:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function deleteAddress(req,res){
    try {
        const {addressId}=req.params;
        const address=User.addresses.id(addressId);
        if(!address){
            return res.status(404).json({message:"Address not found"});
        }
        const {user}=req.user;
        user.addresses.pull(address);
        await user.save();
        return res.status(200).json({message:"Address deleted successfully",addresses:User.addresses});
    } catch (error) {
        console.error("Error deleting address:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function addToWishlist(req,res){
    try {
        const {productId}=req.body;
        if(!productId){
            return res.status(400).json({message:"Product ID is required"});
        }
        const {user}=req.user;
        if(user.wishlist.includes(productId)){
            return res.status(400).json({message:"Product already in wishlist"});
        }
        user.wishlist.push(productId);
        await user.save();
        return res.status(200).json({message:"Product added to wishlist",wishlist:user.wishlist});
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}  

export async function removeFromWishlist(req,res){
    try {
        const {productId}=req.params;
        const {user}=req.user;
        if(!user.wishlist.includes(productId)){
            return res.status(404).json({message:"Product not found in wishlist"});
        }
        user.wishlist.pull(productId);
        await user.save();
        return res.status(200).json({message:"Product removed from wishlist",wishlist:user.wishlist});
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export async function getWishlist(req,res){
    try {
        const {user}=req.user;
        return res.status(200).json({wishlist:user.wishlist});
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
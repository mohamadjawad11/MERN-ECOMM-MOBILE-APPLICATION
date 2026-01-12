import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";

// Middleware to protect routes to see if user is authenticated or not
export const protectRoute=[
    requireAuth(),
    async (req,res,next)=>{
        try{
            const clerkUserId=req.auth.userId;
            if(!clerkUserId){
                return res.status(401).json({message:"Unauthorized"});
            }
            const user=await User.findOne({clerkUserId:clerkUserId});
            if(!user){
                return res.status(401).json({message:"Unauthorized"});
            }
            req.user=user; //attach the user to the req object so that later controllers can use it
            next(); // next means go to the next middleware or controller in the route case it will
                    // call adminOnly the admin will call the controller function
        }catch(err){
            console.error("Error in protectRoute middleware:",err);
            res.status(500).json({message:"Internal Server Error"});
        }
    }
]


export const adminOnly=async(req,res,next)=>{

    if(!req.user){
        return res.status(401).json({message:"Unauthorized"});
    }

    if(req.user.email !== process.env.ADMIN_EMAIL){
        return res.status(403).json({message:"Forbidden: Admins only"});
    }
    next();
}
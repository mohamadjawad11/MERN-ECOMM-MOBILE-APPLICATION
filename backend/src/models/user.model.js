import mongoose from "mongoose";


// address sub-schema that will be used in user schema for multiple addresses
const addressSchema = new mongoose.Schema({
    label: { type: String, required: true },
    fullName: { type: String, required: true },
    streetAdderss: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

// user schema attributes that will be stored in the database
const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        imageUrl: { type: String,default: "" },
        clerkId: { type: String, required: true, unique: true },
        addresses:[addressSchema],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },{ timestamps: true });

    export const User = mongoose.model("User", userSchema);
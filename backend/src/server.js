import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/nextjs/server'

dotenv.config();

const app = express();

// add auth object to the request
app.use(clerkMiddleware()); 

const PORT = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.status(200).send("OK");
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});




import express from 'express';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import { serve } from 'inngest/express';
import { inngest,inngestFunctions } from './config/inngest.js';



dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// from the documentation of inngest
app.use(express.json());
app.use(clerkMiddleware()); 

// from the documentation of inngest to serve inngest functions
app.use('/api/inngest',serve({client: inngest, functions: inngestFunctions}));
// app.use("api/admin",adminRoutes);


app.get("/", (req, res) => {
  res.status(200).send("OK");
});


const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
startServer();

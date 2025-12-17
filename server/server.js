// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './configs/db.js';

// import { clerkMiddleware } from '@clerk/express'
// import { serve } from "inngest/express";
// import { inngest, functions } from "./inngest/index.js"

// dotenv.config();

// const app = express();

// const PORT = 3000;

// await connectDB()

// //Middleware
// app.use(express.json());
// app.use(cors());
// app.use(clerkMiddleware())

// // api route
// app.get('/', (req,res)=>res.send('Server is running'))
// // Set up the "/api/inngest" (recommended) routes with the serve handler
// app.use("/api/inngest", serve({ client: inngest, functions }));

// app.listen(PORT, ()=> console.log(`Server is listening at ${PORT}`))


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db.js";

import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// // Health Check Route
// app.get("/", (req, res) => res.send("Server is running"));

// API Routes

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/show', showRouter);

// Start server AFTER DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();

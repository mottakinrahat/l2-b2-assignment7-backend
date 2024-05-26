const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
// Middleware
app.use(
  cors({
    origin: "https://winterwarddrove.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("assignment");
    const collection = db.collection("users");
    const clothesData = db.collection("clothes");
    const donorTestimonial = db.collection("donor");
    const imageGallery = db.collection("gallery");
    const donationData = db.collection("donation");
    const gratitudeComment = db.collection("comments");
    const volunteerData = db.collection("volunteers");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { name: user.name, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.EXPIRES_IN,
        }
      );
      res.cookie("token", token, {
        secure: process.env.NODE_ENV === "development",
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    app.post("/api/v1/clothes", async (req, res) => {
      try {
        const body = req.body;
        const result = await clothesData.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error in personalInfo route:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });
    app.post("/api/v1/donation", async (req, res) => {
      try {
        const body = req.body;
        const result = await donationData.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error in personalInfo route:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });
    app.post("/api/v1/comments", async (req, res) => {
      try {
        const body = req.body;
        const result = await gratitudeComment.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error in personalInfo route:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });
    app.post("/api/v1/donor", async (req, res) => {
      try {
        const body = req.body;
        const result = await donorTestimonial.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error in personalInfo route:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });
    app.post("/api/v1/volunteer", async (req, res) => {
      try {
        const body = req.body;
        const result = await volunteerData.insertOne(body);
        res.send(result);
      } catch (error) {
        console.error("Error in personalInfo route:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    });

    app.get("/api/v1/clothes", async (req, res) => {
      const result = await clothesData.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/comments", async (req, res) => {
      const result = await gratitudeComment.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/donation", async (req, res) => {
      const result = await donationData.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/donor", async (req, res) => {
      const result = await donorTestimonial.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/gallery", async (req, res) => {
      const result = await imageGallery.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/volunteer", async (req, res) => {
      const result = await volunteerData.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/clothes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await clothesData.findOne(query);
      res.send(result);
    });
    app.put("/api/v1/clothes/:id", async (req, res) => {
      const id = req.params.id;
      const clothesInfo = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateClothes = {
        $set: {
          image: clothesInfo.image,
          title: clothesInfo.title,
          category: clothesInfo.category,
          size: clothesInfo.size,
          description: clothesInfo.description,
        },
      };

      const result = await clothesData.updateOne(
        filter,
        updateClothes,
        options
      );
      res.send(result);
    });

    app.delete("/api/v1/clothes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await clothesData.deleteOne(query);
      res.send(result);
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1️⃣ MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/skycast_db')
  .then(() => console.log("Local MongoDB Connected!"))
  .catch(err => console.error("MongoDB connection error:", err));

// 2️⃣ Schema (MATCHES frontend data)
const historySchema = new mongoose.Schema({
  city: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  weather: {
    type: String
  },
  humidity: {
    type: Number
  },
  windSpeed: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const History = mongoose.model('History', historySchema);

// 3️⃣ Routes

// Save weather search
app.post('/api/history', async (req, res) => {
  try {
    const history = new History({
      city: req.body.city,
      temperature: req.body.temperature,
      weather: req.body.weather,
      humidity: req.body.humidity,
      windSpeed: req.body.windSpeed
    });

    await history.save();

    res.status(201).json({
      message: "Weather history saved successfully",
      data: history
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to save data",
      error: error.message
    });
  }
});

// Test route (OPTIONAL but useful)
app.get("/", (req, res) => {
  res.send("SkyCast Backend is running 🚀");
});

// Server start
app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
import mongoose from "mongoose";

const safetyNodeSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  geohash: {
    type: String,
    index: true, // critical
  },
  lampCount: Number,
  lightingScore: Number,
  safetyScore: Number
});

export default mongoose.model("SafetyNode", safetyNodeSchema);
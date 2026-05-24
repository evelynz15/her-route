import mongoose from "mongoose";

const safetyNodeSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  geohash: {
    type: String,
    index: true, // critical
  },
  
  // Lighting
  lampCount: Number,
  lightingScore: Number,

  // Activity / human presence
  restaurantCount: {
    type: Number,
    default: 0
  },

  cafeCount: {
    type: Number,
    default: 0
  },

  shopCount: {
    type: Number,
    default: 0
  },

  transitStopCount: {
    type: Number,
    default: 0
  },

  openLateCount: {
    type: Number,
    default: 0
  },

  activityScore: {
    type: Number,
    default: 0
  },

   cameraCount: {
    type: Number,
    default: 0
  },
  
  userVoteSum: {
    type: Number,
    default: 0
  },
  userVoteCount: {
    type: Number,
    default: 0
  },
  safetyScore: Number
});

export default mongoose.model("SafetyNode", safetyNodeSchema);
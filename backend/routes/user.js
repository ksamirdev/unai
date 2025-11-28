const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireVerification } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Configure multer for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `profile_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures!'));
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, requireVerification, async (req, res) => {
  try {
    const { fullName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/profile/upload-image', auth, requireVerification, profileUpload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Delete old profile image if exists
    const user = await User.findById(req.user._id);
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../../', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile image
    const profileImageUrl = `/uploads/profiles/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image uploaded successfully',
      profileImageUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, requireVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const stats = {
      totalDetections: user.detectionHistory.length,
      deepfakesDetected: user.detectionHistory.filter(d => d.isDeepfake).length,
      authenticImages: user.detectionHistory.filter(d => !d.isDeepfake).length,
      averageConfidence: user.detectionHistory.length > 0 
        ? user.detectionHistory.reduce((sum, d) => sum + d.confidence, 0) / user.detectionHistory.length 
        : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

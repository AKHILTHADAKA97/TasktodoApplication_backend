import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, email, avatar, bio } = req.body;

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;

    if (avatar !== undefined) {
      if (avatar && avatar.startsWith('data:image/')) {
        const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const rawExt = matches[1];
          let ext = 'png';
          if (rawExt.includes('jpeg') || rawExt.includes('jpg')) {
            ext = 'jpg';
          } else if (rawExt.includes('gif')) {
            ext = 'gif';
          } else if (rawExt.includes('webp')) {
            ext = 'webp';
          } else if (rawExt.includes('svg')) {
            ext = 'svg';
          }

          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const emailToUse = email || user.email;
          const fileSafeEmail = emailToUse.replace(/[^a-zA-Z0-9]/g, '_');
          const filename = `${fileSafeEmail}.${ext}`;
          
          const uploadDir = path.join(__dirname, '..', 'upload', 'profile');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }

          const filePath = path.join(uploadDir, filename);
          await fs.promises.writeFile(filePath, buffer);
          
          const host = req.get('host');
          const protocol = req.protocol;
          user.avatar = `${protocol}://${host}/uploads/profile/${filename}`;
        }
      } else {
        user.avatar = avatar;
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email is already in use by another account');
      }
      user.email = email;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      }
    });
  } catch (error) {
    next(error);
  }
};

// change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new passwords');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Incorrect current password');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters long');
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

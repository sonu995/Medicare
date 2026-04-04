const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'medicare-plus-secret-key-2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

const mockUsers = [
  {
    _id: 'mock-user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    phone: '9876543210',
    role: 'patient',
    isActive: true
  }
];

console.log('Mock user initialized with password: test123');

const isMongoConnected = () => {
  try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    console.log('MongoDB connection state:', state, '(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');
    return state === 1;
  } catch (e) {
    console.log('MongoDB error:', e.message);
    return false;
  }
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already registered' 
        });
      }

      const user = new User({ name, email, password, phone, role });
      await user.save();

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } else {
      const existingMock = mockUsers.find(u => u.email === email);
      if (existingMock) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already registered' 
        });
      }

      const newUser = {
        _id: `mock-${Date.now()}`,
        name,
        email,
        password: password,
        phone,
        role: role || 'patient',
        isActive: true
      };
      mockUsers.push(newUser);

      const token = generateToken(newUser._id);
      const { password: _, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email, password });
    console.log('Mock users:', mockUsers.map(u => u.email));

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Use mock users
    const user = mockUsers.find(u => u.email === email);
    console.log('Found user:', user ? user.name : 'NOT FOUND');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is disabled' 
      });
    }

    if (user.password !== password) {
      console.log('Password mismatch:', { input: password, stored: user.password });
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(user._id);

    console.log('Login successful!');
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoConnected()) {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.json({ success: true, data: user.toJSON() });
    } else {
      const user = mockUsers.find(u => u._id === decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ success: true, data: userWithoutPassword });
    }
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, phone } = req.body;

    if (isMongoConnected()) {
      const user = await User.findByIdAndUpdate(
        decoded.id,
        { name, phone },
        { new: true, runValidators: true }
      );
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      return res.json({ success: true, data: user.toJSON() });
    } else {
      const userIndex = mockUsers.findIndex(u => u._id === decoded.id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], name, phone };
      const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
      return res.json({ success: true, data: userWithoutPassword });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(decoded.id).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      const newToken = generateToken(user._id);
      return res.json({ success: true, message: 'Password changed successfully', data: { token: newToken } });
    } else {
      const userIndex = mockUsers.findIndex(u => u._id === decoded.id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, mockUsers[userIndex].password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      mockUsers[userIndex].password = await bcrypt.hash(newPassword, 12);
      const newToken = generateToken(mockUsers[userIndex]._id);
      return res.json({ success: true, message: 'Password changed successfully', data: { token: newToken } });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

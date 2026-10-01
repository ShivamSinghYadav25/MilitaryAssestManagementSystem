const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    console.log('===== LOGIN START =====');

    const { email, password } = req.body;

    console.log('Email:', email);
    console.log('Password received:', !!password);

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    console.log('1. Searching user...');

    const user = await prisma.user.findUnique({
      where: { email },
      include: { base: true }
    });

    console.log('2. User found:', !!user);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log('3. Checking password...');

    const isValidPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    console.log('4. Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    console.log('5. JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing');
    }

    console.log('6. Creating JWT...');

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        baseId: user.baseId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    console.log('7. JWT created successfully');
    console.log('===== LOGIN SUCCESS =====');

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        baseId: user.baseId,
        baseName: user.base?.name || null
      }
    });

  } catch (error) {
    console.error('===== LOGIN ERROR =====');
    console.error(error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('=======================');

    return res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { base: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
      baseName: user.base?.name || null
    });

  } catch (error) {
    console.error('ME ERROR:', error);

    return res.status(500).json({
      error: 'Failed to fetch user'
    });
  }
});

module.exports = router;
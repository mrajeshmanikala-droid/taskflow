const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Seed sample tasks for a newly registered user
const seedTasksForUser = async (userId) => {
  try {
    const tasksData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'data', 'sampleTasks.json'), 'utf-8')
    );

    const priorities = ['low', 'medium', 'high'];

    for (const t of tasksData) {
      const randomDays = Math.floor(Math.random() * 7) + 1;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + randomDays);

      await Task.create({
        ...t,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: dueDate.toISOString(),
        userId
      });
    }
  } catch (err) {
    console.error('⚠️ Could not seed sample tasks:', err.message);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      // Auto-seed sample tasks for a new user
      await seedTasksForUser(user.id);

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name.trim();
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile };

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./auth');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Authentication Routes ---

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    
    // Check for unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'email') {
        return res.status(400).json({ error: 'Email already registered' });
      } else if (field === 'username') {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    res.status(400).json({ error: 'Signup failed. Please try again with different credentials.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- Protected Routes (Require Login) --- nn

// Get all exercises (Library)
app.get('/api/exercises', authMiddleware, async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add a new exercise to the library
app.post('/api/exercises', authMiddleware, async (req, res) => {
  const { name, sets, reps, duration } = req.body;
  try {
    const exercise = await prisma.exercise.create({
      data: { name, sets, reps, duration },
    });
    res.status(201).json(exercise);
  } catch (error) {
    res.status(400).json({ error: 'Could not create exercise' });
  }
});

// Delete an exercise from the library
app.delete('/api/exercises/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.exercise.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Exercise deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Could not delete exercise' });
  }
});

// Get User's Weekly Schedule
app.get('/api/schedule', authMiddleware, async (req, res) => {
  try {
    const schedule = await prisma.workoutSchedule.findMany({
      where: { userId: req.user.id },
      include: { exercise: true },
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Add Exercise to Schedule
app.post('/api/schedule', authMiddleware, async (req, res) => {
  const { dayOfWeek, exerciseId } = req.body;
  try {
    const item = await prisma.workoutSchedule.create({
      data: {
        userId: req.user.id,
        dayOfWeek,
        exerciseId: parseInt(exerciseId),
      },
      include: { exercise: true }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: 'Could not add to schedule (might already exist for this day)' });
  }
});

// Remove Exercise from Schedule
app.delete('/api/schedule', authMiddleware, async (req, res) => {
  const { dayOfWeek, exerciseId } = req.body;
  try {
    await prisma.workoutSchedule.deleteMany({
      where: {
        userId: req.user.id,
        dayOfWeek,
        exerciseId: parseInt(exerciseId),
      },
    });
    res.json({ message: 'Removed from schedule' });
  } catch (error) {
    res.status(400).json({ error: 'Could not remove from schedule' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
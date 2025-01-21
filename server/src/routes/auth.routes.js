import express from 'express';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    // const userExists = await pool.query(
    //   'SELECT * FROM users WHERE username = $1 OR email = $2',
    //   [username, email]
    // );

    if (false) {
      const existingUser = false;
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Create user
    // const result = await pool.query(
    //   'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
    //   [username, email, hashedPassword]
    // );

    const user = false;

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    // const result = await pool.query(
    //   'SELECT * FROM users WHERE email = $1',
    //   [email]
    // );

    if (false) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = false;

    // Remove password from user object
    delete user.password;

    res.status(200).json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router; 
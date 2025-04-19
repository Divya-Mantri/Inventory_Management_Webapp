// require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');





const app = express();
const port = 3000;



// Enable CORS for all origins
app.use(cors());

// Enable JSON parsing
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'jiDpTfLmZjAbWkcCxmeCVaNoOIRaxnJO',
  database: 'railway'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err.stack);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
// Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1]; 
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded; // Store the decoded user info for use in routes
    next(); // Continue to the route
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Inventory Management System!');
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', {
      expiresIn: '1h'
    });

    res.json({ message: 'Login successful', token });
  });
});

//  Get all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      res.status(500).json({ message: 'Database error' });
      return;
    }
    res.json(results);
  });
});
//  Get a specific product by ID
app.get('/products/:id', (req, res) => {
  const productId = req.params.id; // Get the ID from the URL 

  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' }); 
    }

    res.json(results[0]); // Send the product as JSON
  });
});

// Add a product 
app.post('/products', verifyToken, (req, res) => {
  const { name, price, quantity, description, category } = req.body;

  // Check if all required fields are present
  if (!name || price === undefined || quantity === undefined || !description || !category) {
    return res.status(400).json({ message: 'All fields (name, price, quantity, description, category) are required' });
  }

  const query = 'INSERT INTO products (name, price, quantity, description, category) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, price, quantity, description, category], (err, result) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// Test route to check POST handling
app.post('/test', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ message: 'Data received successfully!' });
});

//  Delete a product
app.delete('/products/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [productId], (err, result) => {
      if (err) {
          console.error('Error deleting product:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product deleted successfully' });
  });
});

//  Update a product by ID
app.put('/products/:id', verifyToken, (req, res) => {
  const productId = req.params.id; // Get the ID from the URL
  const { name, price, quantity, description, category } = req.body; // Get the updated data from the request body

  const query = 'UPDATE products SET name = ?, price = ?, quantity = ?, description = ?, category = ? WHERE id = ?';
  db.query(query, [name, price, quantity, description, category, productId], (err, result) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  });
});

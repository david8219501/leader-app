const cors = require('cors');
const express = require('express'); 
const app = express(); 

app.use(cors());
app.use(express.json());

var db = require("./database.js");

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Get all users
app.get("/api/users", (req, res) => {
  const sql = "SELECT * FROM user";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

// Get a single user by ID
app.get("/api/users/:id", (req, res) => {
  const sql = "SELECT * FROM user WHERE id = ?";
  const params = [req.params.id];
  
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json({ data: row });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});


// Create a new user
app.post("/api/users", (req, res) => {
  const newUser = req.body;
  const query = `
    INSERT INTO user (firstName, lastName, phoneNumber, email, password, is_connected) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [
    newUser.firstName,
    newUser.lastName,
    newUser.phoneNumber,
    newUser.email,
    newUser.password,
    newUser.is_connected || 0
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: "New user added successfully", id: this.lastID });
    }
  });
});

// Delete a user
app.delete("/api/users/:id", (req, res) => {
  const sql = 'DELETE FROM user WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "User deleted successfully", rowsAffected: this.changes });
    }
  });
});

// Update a user
app.put("/api/users/:id", (req, res) => {
  const editedUser = req.body;
  const userId = req.params.id;

  const query = `
    UPDATE user
    SET 
      firstName = ?,
      lastName = ?,
      phoneNumber = ?,
      email = ?,
      password = ?,
      is_connected = ?
    WHERE id = ?
  `;
  const params = [
    editedUser.firstName,
    editedUser.lastName,
    editedUser.phoneNumber,
    editedUser.email,
    editedUser.password,
    editedUser.is_connected || 0,
    userId
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "User updated successfully", rowsAffected: this.changes });
    }
  });
});

// Get all employees
app.get("/api/employees", (req, res) => {
  const sql = "SELECT * FROM employees";
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

// Create a new employee
app.post("/api/employees", (req, res) => {
  const newEmployee = req.body;
  const query = `
    INSERT INTO employees (firstName, lastName, position, phoneNumber, email) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    newEmployee.firstName,
    newEmployee.lastName,
    newEmployee.position,
    newEmployee.phoneNumber,
    newEmployee.email
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: "New employee added successfully", id: this.lastID });
    }
  });
});

// Delete an employee
app.delete("/api/employees/:id", (req, res) => {
  const sql = 'DELETE FROM employees WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Employee deleted successfully", rowsAffected: this.changes });
    }
  });
});

// Update an employee
app.put("/api/employees/:id", (req, res) => {
  const editedEmployee = req.body;
  const employeeId = req.params.id;

  const query = `
    UPDATE employees
    SET 
      firstName = ?,
      lastName = ?,
      position = ?,
      phoneNumber = ?,
      email = ?
    WHERE id = ?
  `;
  const params = [
    editedEmployee.firstName,
    editedEmployee.lastName,
    editedEmployee.position,
    editedEmployee.phoneNumber,
    editedEmployee.email,
    employeeId
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Employee updated successfully", rowsAffected: this.changes });
    }
  });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});

const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');

    // Create the user table
    db.run(`CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_connected BOOLEAN DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('User table created successfully.');
      }
    });

    // Create the employees table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      position TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      photo TEXT DEFAULT 'users_images/userDefultImg.png'
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Employees table created successfully.');

        // Insert data into employees table
        const employees = [
          { firstName: 'יוסי', lastName: 'כהן', position: 'מנהל פרויקטים', phoneNumber: '050-1234567', email: 'yossi.cohen@example.com' },
          { firstName: 'מיה', lastName: 'לוי', position: 'מפתח תוכנה', phoneNumber: '052-2345678', email: 'mya.levi@example.com' },
          { firstName: 'אבי', lastName: 'פנחסי', position: 'מעצב גרפי', phoneNumber: '054-3456789', email: 'avi.phenhasi@example.com' },
          // Other employees...
        ];

        const insertQuery = `
          INSERT INTO employees (firstName, lastName, position, phoneNumber, email) 
          VALUES (?, ?, ?, ?, ?)
        `;

        employees.forEach(employee => {
          db.run(insertQuery, [employee.firstName, employee.lastName, employee.position, employee.phoneNumber, employee.email], (err) => {
            if (err) {
              console.error('Error inserting employee:', err.message);
            }
          });
        });

        console.log('Employees data inserted successfully.');
      }
    });
  }
});

module.exports = db;

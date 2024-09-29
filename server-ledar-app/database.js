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
      position TEXT NOT NULL DEFAULT 'מנהלת', 
      phoneNumber TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      is_connected BOOLEAN DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating user table:', err.message);
      } else {
        console.log('User table created successfully.');
      }
    });

    // Create the employees table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      position TEXT NOT NULL DEFAULT 'עובדת', 
      phoneNumber TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      photo TEXT DEFAULT 'users_images/userDefaultImg.png'
    )`, (err) => {
      if (err) {
        console.error('Error creating employees table:', err.message);
      } else {
        console.log('Employees table created successfully.');
      }
    });

    // Create the shifts table
    db.run(`CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_date DATE NOT NULL,
      shift_type TEXT NOT NULL,
      shift_day TEXT NOT NULL, 
      UNIQUE (shift_date, shift_type)
    )`, (err) => {
      if (err) {
        console.error('Error creating shifts table:', err.message);
      } else {
        console.log('Shifts table created successfully.');
      }
    });
    

    // Create the shift_assignments table
    db.run(`CREATE TABLE IF NOT EXISTS shift_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      worker_number INTEGER NOT NULL,
      FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE (shift_id, worker_number)
    )`, (err) => {
      if (err) {
        console.error('Error creating shift assignments table:', err.message);
      } else {
        console.log('Shift Assignments table created successfully.');
      }
    });
  }
});

// אופציונלי: סגירת חיבור למסד הנתונים בצורה מסודרת
process.on('exit', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});

module.exports = db;

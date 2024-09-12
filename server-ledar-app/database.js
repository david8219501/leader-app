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
      email TEXT NOT NULL UNIQUE
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Employees table created successfully.');

        // Insert fake data
        const insert = 'INSERT INTO employees (firstName, lastName, position, phoneNumber, email) VALUES (?, ?, ?, ?, ?)';
        db.run(insert, ['יוסי', 'כהן', 'מנהל', '050-1234567', 'yossi@cohen.com'], (err) => {
          if (err) {
            console.error(err.message);
          }
        });
        db.run(insert, ['מיכל', 'לוי', 'מזכירה', '050-2345678', 'michal@levi.com'], (err) => {
          if (err) {
            console.error(err.message);
          }
        });
        db.run(insert, ['דניאל', 'מזרחי', 'מהנדס', '050-3456789', 'daniel@mizrahi.com'], (err) => {
          if (err) {
            console.error(err.message);
          }
        });

        console.log('Fake data inserted into employees table.');
      }
    });
  }
});

module.exports = db;

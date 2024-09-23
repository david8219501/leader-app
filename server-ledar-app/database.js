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

        // Insert a sample user into the user table
        const user = {
          firstName: 'דוד',
          lastName: 'מאור',
          phoneNumber: '050-7654321',
          email: 'david.maor@example.com',
          password: 'password123'
        };

        const insertUserQuery = `
          INSERT INTO user (firstName, lastName, phoneNumber, email, password) 
          VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertUserQuery, [user.firstName, user.lastName, user.phoneNumber, user.email, user.password], (err) => {
          if (err) {
            console.error('Error inserting user:', err.message);
          } else {
            console.log('User data inserted successfully.');
          }
        });
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

    db.run(`CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_date DATE NOT NULL,
      shift_type TEXT NOT NULL,
      shift_day TEXT NOT NULL,  -- הוספת עמודה עבור היום
      UNIQUE (shift_date, shift_type)
    )`, (err) => {
      if (err) {
        console.error(err.message);
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
          console.error(err.message);
        } else {
          console.log('Shift Assignments table created successfully.');
  
          // Insert sample data into shift_assignments
          const shiftAssignments = [
            // משמרת בוקר 2024-09-18
            { shift_id: 1, worker_id: 1, worker_number: 1 }, // עובד 1
            { shift_id: 1, worker_id: 2, worker_number: 2 }, // עובד 2
            { shift_id: 1, worker_id: 3, worker_number: 3 }, // עובד 3
            
            // משמרת צהריים 2024-09-18
            { shift_id: 2, worker_id: 1, worker_number: 1 },
            { shift_id: 2, worker_id: 2, worker_number: 2 },
            { shift_id: 2, worker_id: 3, worker_number: 3 },
  
            // משמרת ערב 2024-09-18
            { shift_id: 3, worker_id: 1, worker_number: 1 },
            { shift_id: 3, worker_id: 2, worker_number: 2 },
            { shift_id: 3, worker_id: 3, worker_number: 3 },
  
            // משמרת בוקר 2024-09-19
            { shift_id: 4, worker_id: 1, worker_number: 1 },
            { shift_id: 4, worker_id: 2, worker_number: 2 },
            { shift_id: 4, worker_id: 3, worker_number: 3 },
  
            // משמרת צהריים 2024-09-19
            { shift_id: 5, worker_id: 1, worker_number: 1 },
            { shift_id: 5, worker_id: 2, worker_number: 2 },
            { shift_id: 5, worker_id: 3, worker_number: 3 },
  
            // משמרת ערב 2024-09-19
            { shift_id: 6, worker_id: 1, worker_number: 1 },
            { shift_id: 6, worker_id: 2, worker_number: 2 },
            { shift_id: 6, worker_id: 3, worker_number: 3 }
          ];
  
          const insertShiftAssignmentQuery = `
            INSERT INTO shift_assignments (shift_id, worker_id, worker_number)
            VALUES (?, ?, ?)
          `;
  
          shiftAssignments.forEach(assignment => {
            db.run(insertShiftAssignmentQuery, [assignment.shift_id, assignment.worker_id, assignment.worker_number], (err) => {
              if (err) {
                console.error('Error inserting shift assignment:', err.message);
              }
            });
          });
  
          console.log('Shift assignments data inserted successfully.');
        }
      });
  }
});

module.exports = db;

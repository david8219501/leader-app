const cors = require('cors');
const express = require('express');
const app = express();
const db = require('./database.js'); // ודא שהקובץ database.js נמצא באותה תיקייה
const path = require('path'); // ייבוא מודול path
const moment = require('moment');


app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Check if there are any users and redirect to login if not
// Check if there are any users and return true/false
// Check if there are any users and return true/false
app.get('/api/users/check', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM user';

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('Error checking users count:', err.message);
      // במקרה של שגיאה, נחזיר false
      return res.json({ exists: false });
    }

    // מחזירים true אם יש משתמשים ו-false אם אין
    res.json({ exists: row.count > 0 }); // true אם יש משתמשים, false אם אין
  });
});



// Get all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM user';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

// Get a single user by ID
app.get('/api/users/:id', (req, res) => {
  const sql = 'SELECT * FROM user WHERE id = ?';
  const params = [req.params.id];
  
  db.get(sql, params, (err, row) => {
    if (err) {
      console.error('Error fetching user:', err.message);
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.json({ data: row });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
});

app.post('/api/users', (req, res) => {
  const newUser = req.body;

  // Validate required fields
  if (!newUser.firstName || !newUser.lastName || !newUser.phoneNumber || !newUser.email || !newUser.password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const query = `
    INSERT INTO user (firstName, lastName, position, phoneNumber, email, password, is_connected) 
    VALUES (?, ?, 'מנהלת', ?, ?, ?, ?)
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
      console.error('Error creating user:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'New user added successfully', id: this.lastID });
    }
  });
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
  const sql = 'DELETE FROM user WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error deleting user:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User deleted successfully', rowsAffected: this.changes });
    }
  });
});

// Update a user
app.put('/api/users/:id', (req, res) => {
  const editedUser = req.body;
  const userId = req.params.id;

  const query = `
    UPDATE user
    SET 
      firstName = ?,
      lastName = ?,
      position = 'מנהלת',  
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
      console.error('Error updating user:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'User updated successfully', rowsAffected: this.changes });
    }
  });
});


// Get all employees
app.get('/api/employees', (req, res) => {
  const sql = 'SELECT * FROM employees';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching employees:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

// Create a new employee
app.post('/api/employees', (req, res) => {
  const newEmployee = req.body;

  // בדיקה אם המייל כבר קיים
  const checkEmailQuery = 'SELECT * FROM employees WHERE email = ?';
  db.get(checkEmailQuery, [newEmployee.email], (err, row) => {
    if (err) {
      console.error('שגיאה בבדיקת מייל:', err.message);
      return res.status(500).json({ error: 'שגיאה בבדיקת מייל' });
    }

    if (row) {
      // החזרת הודעה למשתמש אם המייל כבר קיים
      return res.json({ message: 'המייל כבר קיים במערכת' });
    }

    // אם המייל לא קיים, המשך עם ההכנסה
    const position = newEmployee.position || 'עובדת';
    const query = `
      INSERT INTO employees (firstName, lastName, position, phoneNumber, email) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      newEmployee.firstName,
      newEmployee.lastName,
      position,
      newEmployee.phoneNumber,
      newEmployee.email
    ];

    db.run(query, params, function (err) {
      if (err) {
        console.error('שגיאה ביצירת עובד:', err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ message: 'עובד חדש נוסף בהצלחה', id: this.lastID });
      }
    });
  });
});

// Update an employee
app.put('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  const editedEmployee = req.body;

  // בדיקה אם יש משתמש אחר עם אותו מייל לפני עדכון המשתמש
  const checkEmailQuery = 'SELECT * FROM employees WHERE email = ? AND id != ?';
  db.get(checkEmailQuery, [editedEmployee.email, employeeId], (err, row) => {
    if (err) {
      console.error('שגיאה בבדיקת מייל:', err.message);
      return res.status(500).json({ error: 'שגיאה בבדיקת מייל' });
    }

    if (row) {
      // אם מצאנו משתמש אחר עם אותו מייל, מחזירים הודעה ולא שגיאה
      return res.status(400).json({ message: 'המייל כבר קיים במערכת' });
    }

    // עדכון המשתמש אם לא נמצא משתמש עם אותו מייל
    const position = editedEmployee.position || 'עובדת';

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
      position,
      editedEmployee.phoneNumber,
      editedEmployee.email,
      employeeId
    ];

    db.run(query, params, function (err) {
      if (err) {
        console.error('שגיאה בעדכון עובד:', err.message);
        return res.status(500).json({ error: err.message });
      } else {
        res.json({ message: 'העובד עודכן בהצלחה', rowsAffected: this.changes });
      }
    });
  });
});

// Delete an employee
app.delete('/api/employees/:id', (req, res) => {
  const sql = 'DELETE FROM employees WHERE id = ?';
  const params = [req.params.id];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error deleting employee:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Employee deleted successfully', rowsAffected: this.changes });
    }
  });
});

// Update an employee
app.put('/api/employees/:id', (req, res) => {
  const editedEmployee = req.body;
  const employeeId = req.params.id;

  const position = editedEmployee.position || 'עובדת'; // אם לא הוכנס position, השתמש בערך 'עובדת'

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
    position, 
    editedEmployee.phoneNumber,
    editedEmployee.email,
    employeeId
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error('Error updating employee:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Employee updated successfully', rowsAffected: this.changes });
    }
  });
});

// Get shifts with employees between two dates
app.get('/api/shifts/', (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Please provide both startDate and endDate' });
  }

  const query = `
    SELECT 
      s.shift_date, 
      s.shift_type, 
      s.shift_day,  
      e.firstName, 
      e.lastName, 
      sa.worker_number
    FROM 
      shifts s
    JOIN 
      shift_assignments sa ON s.id = sa.shift_id
    JOIN 
      employees e ON sa.worker_id = e.id
    WHERE 
      s.shift_date BETWEEN ? AND ?
    ORDER BY 
      s.shift_date, s.shift_type, e.lastName, e.firstName
  `;

  db.all(query, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error('Error retrieving shifts with employees:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

app.post('/api/shifts/range', (req, res) => {
  console.log('Received request:', req.body);

  const { startDate, endDate } = req.body;

  const parseDate = (dateString) => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // חודשים מתחילים מ-0
    const year = parseInt(parts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year;

    return new Date(Date.UTC(fullYear, month, day));
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    console.error('Invalid date range:', { startDate, endDate });
    return res.status(400).json({ error: 'Invalid date range' });
  }

  const existingShiftsQuery = `
    SELECT shift_date, shift_type 
    FROM shifts 
    WHERE shift_date BETWEEN ? AND ?
  `;

  console.log('Querying existing shifts...');
  db.all(existingShiftsQuery, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error('Error checking existing shifts:', err.message);
      return res.status(500).json({ error: 'Error checking existing shifts' });
    }

    console.log('Existing shifts retrieved:', rows);
    const existingShifts = new Set(rows.map(shift => `${shift.shift_date}-${shift.shift_type}`));

    const shiftsToInsert = [];
    const shiftTypes = ['בוקר', 'צהריים', 'ערב'];

    const getDayName = (date) => {
      const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      return days[date.getUTCDay()];
    };

    let currentDate = new Date(start);
    while (currentDate <= end) {
      const dayName = getDayName(currentDate);
      shiftTypes.forEach(shiftType => {
        const shiftIdentifier = `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${currentDate.getUTCDate().toString().padStart(2, '0')}-${shiftType}`;
        if (!existingShifts.has(shiftIdentifier)) {
          shiftsToInsert.push({
            date: `${currentDate.getUTCFullYear()}-${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${currentDate.getUTCDate().toString().padStart(2, '0')}`,
            type: shiftType,
            day: dayName
          });
        }
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    console.log('Shifts to insert:', shiftsToInsert);

    if (shiftsToInsert.length === 0) {
      return res.status(200).json({ message: 'All shifts already exist, no new shifts to add.' });
    }

    const insertQuery = `
      INSERT OR IGNORE INTO shifts (shift_date, shift_type, shift_day) 
      VALUES (?, ?, ?)
    `;

    const promises = shiftsToInsert.map(shift => {
      return new Promise((resolve, reject) => {
        db.run(insertQuery, [shift.date, shift.type, shift.day], function (err) {
          if (err) {
            console.error('Error inserting shift:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log('New shifts added successfully');
        res.status(201).json({ message: 'New shifts added successfully' });
      })
      .catch(err => {
        console.error('Failed to add shifts:', err);
        res.status(500).json({ error: 'Error adding shifts', details: err.message });
      });
  });
});

app.delete('/api/shifts/range', (req, res) => {
  const { startDate, endDate } = req.body;

  // בדוק שהשדות לא ריקים
  if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  // המרה לפורמט הנכון
  const trimmedStartDate = moment(startDate.trim(), 'DD/MM/YY').format('YYYY-MM-DD');
  const trimmedEndDate = moment(endDate.trim(), 'DD/MM/YY').format('YYYY-MM-DD');

  console.log(`Trimmed Start Date: ${trimmedStartDate}`);
  console.log(`Trimmed End Date: ${trimmedEndDate}`);

  // שאילתא לבדיקת משמרות בטווח התאריכים
  const fetchShiftIdsQuery = `
      SELECT id FROM shifts 
      WHERE shift_date BETWEEN ? AND ?
  `;

  db.all(fetchShiftIdsQuery, [trimmedStartDate, trimmedEndDate], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }

      // אם לא נמצאו משמרות
      if (rows.length === 0) {
          return res.json({ message: 'No shifts found in the given date range.' });
      }

      // אם נמצאו משמרות, נבצע מחיקה
      const shiftIds = rows.map(row => row.id);
      const deleteAssignmentsQuery = `
          DELETE FROM shift_assignments 
          WHERE shift_id IN (${shiftIds.join(',')})
      `;

      db.run(deleteAssignmentsQuery, function(err) {
          if (err) {
              return res.status(500).json({ error: err.message });
          }

          return res.json({ message: `Successfully deleted ${this.changes} shift assignments.` });
      });
  });
});



app.post('/api/shifts/assign', (req, res) => {
  const assignments = req.body;
  console.log('Received assignments:', assignments);

  // בדוק אם המערך ריק
  if (!assignments || assignments.length === 0) {
      return res.status(400).json({ error: 'No assignments provided' }); // מחזירים תשובה ריקה עם סטטוס שגיאה
  }

  const processedAssignments = [];
  let errorOccurred = false;

  const convertDateFormat = (dateString) => {
      const parts = dateString.split('/');
      if (parts.length !== 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // חודשים מתחילים מ-0
      const year = parseInt(parts[2], 10);
      const fullYear = year < 100 ? 2000 + year : year; // המרה לשנת 2000 אם השנה פחות מ-100

      // החזרת התאריך בפורמט YYYY-MM-DD
      return `${fullYear}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  assignments.forEach(([index, firstName, lastName, shiftType, date]) => {
      const formattedDate = convertDateFormat(date);
      if (!formattedDate) {
          console.error('Invalid date format:', date);
          errorOccurred = true;
          return;
      }

      const getShiftIdQuery = `
          SELECT id FROM shifts WHERE shift_date = ? AND shift_type = ?
      `;

      db.get(getShiftIdQuery, [formattedDate, shiftType], (err, shiftRow) => {
          if (err) {
              console.error('Error fetching shift ID:', err.message);
              errorOccurred = true;
              return;
          }
          if (!shiftRow) {
              console.error(`Shift not found for date: ${formattedDate} and type: ${shiftType}`);
              return; // המשך לולאת ה-forEach
          }
          console.log('Found shift:', shiftRow);

          const getWorkerIdQuery = `
              SELECT id FROM employees WHERE firstName = ? AND lastName = ?
          `;

          db.get(getWorkerIdQuery, [firstName, lastName], (err, workerRow) => {
              if (err) {
                  console.error('Error fetching worker ID:', err.message);
                  errorOccurred = true;
                  return;
              }
              if (!workerRow) {
                  console.error(`Worker not found for name: ${firstName} ${lastName}`);
                  return; // המשך לולאת ה-forEach
              }
              console.log('Found worker:', workerRow);

              const shiftId = shiftRow.id;
              const workerId = workerRow.id;

              const insertAssignmentQuery = `
                  INSERT INTO shift_assignments (shift_id, worker_id, worker_number) 
                  VALUES (?, ?, ?)
              `;

              db.run(insertAssignmentQuery, [shiftId, workerId, index], function(err) {
                  if (err) {
                      console.error('Error inserting shift assignment:', err.message);
                      errorOccurred = true;
                      return;
                  }

                  processedAssignments.push({ shiftId, workerId, workerNumber: index });
              });
          });
      });
  });

  // קובעים עיכוב כדי לוודא שהכל התבצע
  setTimeout(() => {
      if (errorOccurred) {
          return res.status(500).json({ error: 'An error occurred while processing assignments.' });
      }

      res.status(201).json({ message: 'Shift assignments processed', assignments: processedAssignments });
  }, 100);
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

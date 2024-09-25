const cors = require('cors');
const express = require('express');
const app = express();
const db = require('./database.js'); // ודא שהקובץ database.js נמצא באותה תיקייה
const path = require('path'); // ייבוא מודול path


app.use(cors());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

// Basic route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Check if there are any users and redirect to login if not
app.get('/api/users/check', (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM user';

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error('Error checking users count:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      if (row.count > 0) {
        res.json({ exists: true });
      } else {
        res.status(404).json({ exists: false, message: 'No users found. Please log in.' });
      }
    }
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

// Create a new user
app.post('/api/users', (req, res) => {
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
      console.error('Error creating employee:', err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'New employee added successfully', id: this.lastID });
    }
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

    // אם השנה היא בשתי ספרות, המרתה לארבע ספרות
    const fullYear = year < 100 ? 2000 + year : year;

    return new Date(Date.UTC(fullYear, month, day));
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return res.status(400).json({ error: 'Invalid date range' });
  }

  const existingShiftsQuery = `
    SELECT shift_date, shift_type 
    FROM shifts 
    WHERE shift_date BETWEEN ? AND ?
  `;

  db.all(existingShiftsQuery, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error('Error checking existing shifts:', err.message);
      return res.status(500).json({ error: 'Error checking existing shifts' });
    }

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
        const shiftIdentifier = `${currentDate.getUTCDate().toString().padStart(2, '0')}/${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${currentDate.getUTCFullYear().toString().slice(-2)}-${shiftType}`;
        if (!existingShifts.has(shiftIdentifier)) {
          shiftsToInsert.push({
            date: `${currentDate.getUTCDate().toString().padStart(2, '0')}/${(currentDate.getUTCMonth() + 1).toString().padStart(2, '0')}/${currentDate.getUTCFullYear().toString().slice(-2)}`,
            type: shiftType,
            day: dayName
          });
        }
      });
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    if (shiftsToInsert.length === 0) {
      return res.status(200).json({ message: 'All shifts already exist, no new shifts to add.' });
    }

    const insertQuery = `
      INSERT INTO shifts (shift_date, shift_type, shift_day) 
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

  // Validate input
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  const fetchShiftIdsQuery = `
    SELECT id FROM shifts WHERE shift_date BETWEEN ? AND ?
  `;

  db.all(fetchShiftIdsQuery, [startDate, endDate], (err, rows) => {
    if (err) {
      console.error('Failed to fetch shift IDs:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.json({ message: 'No shifts found in the given date range.' });
    }
    
    const shiftIds = rows.map(row => row.id);
    const placeholders = shiftIds.map(() => '?').join(', ');
    const deleteAssignmentsQuery = `
      DELETE FROM shift_assignments WHERE shift_id IN (${placeholders})
    `;

    db.run(deleteAssignmentsQuery, shiftIds, function(err) {
      if (err) {
        console.error('Error deleting shift assignments:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: `${this.changes} shift assignments deleted successfully.` });
    });
  });
});




app.post('/api/shifts/assign', (req, res) => {
  const assignments = req.body;
  console.log('Received assignments:', assignments);

  const processedAssignments = [];
  let errorOccurred = false;

  assignments.forEach(([index, firstName, lastName, shiftType, date]) => {
    const getShiftIdQuery = `
      SELECT id FROM shifts WHERE shift_date = ? AND shift_type = ?
    `;

    db.get(getShiftIdQuery, [date, shiftType], (err, shiftRow) => {
      if (err) {
        console.error('Error fetching shift ID:', err.message);
        errorOccurred = true;
        return;
      }
      if (!shiftRow) {
        console.error(`Shift not found for date: ${date} and type: ${shiftType}`);
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

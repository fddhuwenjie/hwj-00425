const db = require('../config/database');

const initTables = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      employee_id TEXT NOT NULL UNIQUE,
      position TEXT NOT NULL,
      max_hours_per_week INTEGER DEFAULT 40,
      unavailable_slots TEXT DEFAULT '[]',
      group_id INTEGER,
      hourly_wage REAL DEFAULT 15,
      annual_leave_days INTEGER DEFAULT 15,
      used_annual_leave INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'store',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shift_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_holiday INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shift_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_template_id INTEGER,
      position TEXT NOT NULL,
      min_count INTEGER DEFAULT 1,
      FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      shift_template_id INTEGER,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shift_swap_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER,
      target_id INTEGER,
      swap_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES employees(id),
      FOREIGN KEY (target_id) REFERENCES employees(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )`);

    console.log('Database tables created');
  });
};

const insertInitialData = () => {
  db.get('SELECT COUNT(*) as count FROM groups', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO groups (name, type) VALUES 
        ('总店', 'store'),
        ('分店A', 'store'),
        ('分店B', 'store'),
        ('财务部', 'department'),
        ('人事部', 'department')`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM shift_templates', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO shift_templates (name, start_time, end_time, is_holiday) VALUES 
        ('早班', '07:00', '15:00', 0),
        ('中班', '11:00', '19:00', 0),
        ('晚班', '15:00', '23:00', 0),
        ('全天', '09:00', '21:00', 0),
        ('节假日早班', '08:00', '16:00', 1),
        ('节假日晚班', '14:00', '22:00', 1)`);
    }
  });

  db.get('SELECT COUNT(*) as count FROM shift_requirements', (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO shift_requirements (shift_template_id, position, min_count) VALUES 
        (1, '收银', 2), (1, '服务', 3), (1, '厨房', 2), (1, '管理', 1),
        (2, '收银', 3), (2, '服务', 4), (2, '厨房', 3), (2, '管理', 1),
        (3, '收银', 2), (3, '服务', 3), (3, '厨房', 2), (3, '管理', 1),
        (4, '收银', 2), (4, '服务', 3), (4, '厨房', 2), (4, '管理', 1),
        (5, '收银', 3), (5, '服务', 4), (5, '厨房', 3), (5, '管理', 1),
        (6, '收银', 3), (6, '服务', 4), (6, '厨房', 3), (6, '管理', 1)`);
    }
  });
};

module.exports = { initTables, insertInitialData };
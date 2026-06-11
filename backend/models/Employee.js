const db = require('../config/database');

const Employee = {
  getAll: (callback) => {
    db.all('SELECT e.*, g.name as group_name FROM employees e LEFT JOIN groups g ON e.group_id = g.id', callback);
  },

  getById: (id, callback) => {
    db.get('SELECT e.*, g.name as group_name FROM employees e LEFT JOIN groups g ON e.group_id = g.id WHERE e.id = ?', [id], callback);
  },

  create: (data, callback) => {
    const { name, employee_id, position, max_hours_per_week, unavailable_slots, group_id, hourly_wage, annual_leave_days } = data;
    db.run(
      'INSERT INTO employees (name, employee_id, position, max_hours_per_week, unavailable_slots, group_id, hourly_wage, annual_leave_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, employee_id, position, max_hours_per_week, JSON.stringify(unavailable_slots), group_id, hourly_wage, annual_leave_days],
      callback
    );
  },

  update: (id, data, callback) => {
    const { name, position, max_hours_per_week, unavailable_slots, group_id, hourly_wage, annual_leave_days } = data;
    db.run(
      'UPDATE employees SET name = ?, position = ?, max_hours_per_week = ?, unavailable_slots = ?, group_id = ?, hourly_wage = ?, annual_leave_days = ? WHERE id = ?',
      [name, position, max_hours_per_week, JSON.stringify(unavailable_slots), group_id, hourly_wage, annual_leave_days, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.run('DELETE FROM employees WHERE id = ?', [id], callback);
  },

  getByPosition: (position, callback) => {
    db.all('SELECT * FROM employees WHERE position = ?', [position], callback);
  },

  getByGroup: (group_id, callback) => {
    db.all('SELECT * FROM employees WHERE group_id = ?', [group_id], callback);
  }
};

module.exports = Employee;
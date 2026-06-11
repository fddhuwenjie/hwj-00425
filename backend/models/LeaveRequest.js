const db = require('../config/database');

const LeaveRequest = {
  getAll: (callback) => {
    db.all(`SELECT l.*, e.name as employee_name, e.position
             FROM leave_requests l
             LEFT JOIN employees e ON l.employee_id = e.id`, callback);
  },

  getById: (id, callback) => {
    db.get(`SELECT l.*, e.name as employee_name
             FROM leave_requests l
             LEFT JOIN employees e ON l.employee_id = e.id
             WHERE l.id = ?`, [id], callback);
  },

  create: (data, callback) => {
    const { employee_id, type, start_date, end_date } = data;
    db.run(
      'INSERT INTO leave_requests (employee_id, type, start_date, end_date) VALUES (?, ?, ?, ?)',
      [employee_id, type, start_date, end_date],
      callback
    );
  },

  update: (id, data, callback) => {
    const { status } = data;
    db.run('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id], callback);
  },

  delete: (id, callback) => {
    db.run('DELETE FROM leave_requests WHERE id = ?', [id], callback);
  },

  getByEmployee: (employee_id, callback) => {
    db.all('SELECT * FROM leave_requests WHERE employee_id = ?', [employee_id], callback);
  }
};

module.exports = LeaveRequest;
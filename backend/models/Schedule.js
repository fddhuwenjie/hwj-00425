const db = require('../config/database');

const Schedule = {
  getAll: (callback) => {
    db.all(`SELECT s.*, e.name as employee_name, e.position, t.name as shift_name, 
             t.start_time, t.end_time 
             FROM schedules s 
             LEFT JOIN employees e ON s.employee_id = e.id 
             LEFT JOIN shift_templates t ON s.shift_template_id = t.id`, callback);
  },

  getByDateRange: (start_date, end_date, callback) => {
    db.all(`SELECT s.*, e.name as employee_name, e.position, e.group_id,
             t.name as shift_name, t.start_time, t.end_time 
             FROM schedules s 
             LEFT JOIN employees e ON s.employee_id = e.id 
             LEFT JOIN shift_templates t ON s.shift_template_id = t.id
             WHERE s.date BETWEEN ? AND ?
             ORDER BY s.date, t.start_time`, [start_date, end_date], callback);
  },

  getByEmployee: (employee_id, callback) => {
    db.all(`SELECT s.*, t.name as shift_name, t.start_time, t.end_time 
             FROM schedules s 
             LEFT JOIN shift_templates t ON s.shift_template_id = t.id
             WHERE s.employee_id = ?`, [employee_id], callback);
  },

  getByDate: (date, callback) => {
    db.all(`SELECT s.*, e.name as employee_name, e.position,
             t.name as shift_name, t.start_time, t.end_time 
             FROM schedules s 
             LEFT JOIN employees e ON s.employee_id = e.id 
             LEFT JOIN shift_templates t ON s.shift_template_id = t.id
             WHERE s.date = ?`, [date], callback);
  },

  create: (data, callback) => {
    const { employee_id, shift_template_id, date, status } = data;
    db.run(
      'INSERT INTO schedules (employee_id, shift_template_id, date, status) VALUES (?, ?, ?, ?)',
      [employee_id, shift_template_id, date, status || 'confirmed'],
      callback
    );
  },

  update: (id, data, callback) => {
    const { employee_id, shift_template_id, date, status } = data;
    db.run(
      'UPDATE schedules SET employee_id = ?, shift_template_id = ?, date = ?, status = ? WHERE id = ?',
      [employee_id, shift_template_id, date, status, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.run('DELETE FROM schedules WHERE id = ?', [id], callback);
  },

  deleteByDateRange: (start_date, end_date, callback) => {
    db.run('DELETE FROM schedules WHERE date BETWEEN ? AND ?', [start_date, end_date], callback);
  },

  getWeeklyHours: (employee_id, start_date, end_date, callback) => {
    db.get(`SELECT SUM((strftime('%H', t.end_time) - strftime('%H', t.start_time)) + 
                       (strftime('%M', t.end_time) - strftime('%M', t.start_time))/60.0) as total_hours
            FROM schedules s
            LEFT JOIN shift_templates t ON s.shift_template_id = t.id
            WHERE s.employee_id = ? AND s.date BETWEEN ? AND ?`,
      [employee_id, start_date, end_date],
      callback
    );
  }
};

module.exports = Schedule;
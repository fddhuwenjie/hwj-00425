const db = require('../config/database');

const ShiftTemplate = {
  getAll: (callback) => {
    db.all('SELECT * FROM shift_templates', callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM shift_templates WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    const { name, start_time, end_time, is_holiday } = data;
    db.run(
      'INSERT INTO shift_templates (name, start_time, end_time, is_holiday) VALUES (?, ?, ?, ?)',
      [name, start_time, end_time, is_holiday || 0],
      callback
    );
  },

  update: (id, data, callback) => {
    const { name, start_time, end_time, is_holiday } = data;
    db.run(
      'UPDATE shift_templates SET name = ?, start_time = ?, end_time = ?, is_holiday = ? WHERE id = ?',
      [name, start_time, end_time, is_holiday || 0, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.run('DELETE FROM shift_templates WHERE id = ?', [id], callback);
  },

  getRequirements: (shift_template_id, callback) => {
    db.all('SELECT * FROM shift_requirements WHERE shift_template_id = ?', [shift_template_id], callback);
  },

  addRequirement: (shift_template_id, position, min_count, callback) => {
    db.run(
      'INSERT INTO shift_requirements (shift_template_id, position, min_count) VALUES (?, ?, ?)',
      [shift_template_id, position, min_count],
      callback
    );
  },

  updateRequirement: (id, min_count, callback) => {
    db.run('UPDATE shift_requirements SET min_count = ? WHERE id = ?', [min_count, id], callback);
  },

  deleteRequirement: (id, callback) => {
    db.run('DELETE FROM shift_requirements WHERE id = ?', [id], callback);
  }
};

module.exports = ShiftTemplate;
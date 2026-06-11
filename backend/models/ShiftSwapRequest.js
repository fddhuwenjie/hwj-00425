const db = require('../config/database');

const ShiftSwapRequest = {
  getAll: (callback) => {
    db.all(`SELECT s.*, r.name as requester_name, t.name as target_name,
             r.position as requester_position, t.position as target_position
             FROM shift_swap_requests s
             LEFT JOIN employees r ON s.requester_id = r.id
             LEFT JOIN employees t ON s.target_id = t.id`, callback);
  },

  getById: (id, callback) => {
    db.get(`SELECT s.*, r.name as requester_name, t.name as target_name
             FROM shift_swap_requests s
             LEFT JOIN employees r ON s.requester_id = r.id
             LEFT JOIN employees t ON s.target_id = t.id
             WHERE s.id = ?`, [id], callback);
  },

  create: (data, callback) => {
    const { requester_id, target_id, swap_date } = data;
    db.run(
      'INSERT INTO shift_swap_requests (requester_id, target_id, swap_date) VALUES (?, ?, ?)',
      [requester_id, target_id, swap_date],
      callback
    );
  },

  update: (id, data, callback) => {
    const { status } = data;
    db.run('UPDATE shift_swap_requests SET status = ? WHERE id = ?', [status, id], callback);
  },

  delete: (id, callback) => {
    db.run('DELETE FROM shift_swap_requests WHERE id = ?', [id], callback);
  }
};

module.exports = ShiftSwapRequest;
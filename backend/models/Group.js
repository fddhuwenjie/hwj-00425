const db = require('../config/database');

const Group = {
  getAll: (callback) => {
    db.all('SELECT * FROM groups', callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM groups WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    const { name, type } = data;
    db.run('INSERT INTO groups (name, type) VALUES (?, ?)', [name, type], callback);
  },

  update: (id, data, callback) => {
    const { name, type } = data;
    db.run('UPDATE groups SET name = ?, type = ? WHERE id = ?', [name, type, id], callback);
  },

  delete: (id, callback) => {
    db.run('DELETE FROM groups WHERE id = ?', [id], callback);
  }
};

module.exports = Group;
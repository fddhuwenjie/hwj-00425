const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

router.get('/', (req, res) => {
  Group.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  Group.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  Group.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Group created successfully' });
  });
});

router.put('/:id', (req, res) => {
  Group.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Group updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  Group.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Group deleted successfully' });
  });
});

module.exports = router;
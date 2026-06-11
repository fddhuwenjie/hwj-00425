const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.get('/', (req, res) => {
  Employee.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  Employee.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  Employee.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee created successfully' });
  });
});

router.put('/:id', (req, res) => {
  Employee.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  Employee.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted successfully' });
  });
});

router.get('/position/:position', (req, res) => {
  Employee.getByPosition(req.params.position, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/group/:group_id', (req, res) => {
  Employee.getByGroup(req.params.group_id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
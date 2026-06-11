const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');

router.get('/', (req, res) => {
  Schedule.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/range', (req, res) => {
  const { start_date, end_date } = req.query;
  Schedule.getByDateRange(start_date, end_date, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/employee/:employee_id', (req, res) => {
  Schedule.getByEmployee(req.params.employee_id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/date/:date', (req, res) => {
  Schedule.getByDate(req.params.date, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  Schedule.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Schedule created successfully' });
  });
});

router.put('/:id', (req, res) => {
  Schedule.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Schedule updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  Schedule.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Schedule deleted successfully' });
  });
});

router.delete('/range', (req, res) => {
  const { start_date, end_date } = req.query;
  Schedule.deleteByDateRange(start_date, end_date, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Schedules deleted successfully' });
  });
});

module.exports = router;
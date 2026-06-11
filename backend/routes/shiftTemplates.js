const express = require('express');
const router = express.Router();
const ShiftTemplate = require('../models/ShiftTemplate');

router.get('/', (req, res) => {
  ShiftTemplate.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  ShiftTemplate.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  ShiftTemplate.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift template created successfully' });
  });
});

router.put('/:id', (req, res) => {
  ShiftTemplate.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift template updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  ShiftTemplate.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift template deleted successfully' });
  });
});

router.get('/:id/requirements', (req, res) => {
  ShiftTemplate.getRequirements(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/:id/requirements', (req, res) => {
  const { position, min_count } = req.body;
  ShiftTemplate.addRequirement(req.params.id, position, min_count, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Requirement added successfully' });
  });
});

router.put('/requirements/:id', (req, res) => {
  ShiftTemplate.updateRequirement(req.params.id, req.body.min_count, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Requirement updated successfully' });
  });
});

router.delete('/requirements/:id', (req, res) => {
  ShiftTemplate.deleteRequirement(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Requirement deleted successfully' });
  });
});

module.exports = router;
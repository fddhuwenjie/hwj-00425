const express = require('express');
const router = express.Router();
const ShiftSwapRequest = require('../models/ShiftSwapRequest');
const Schedule = require('../models/Schedule');

router.get('/', (req, res) => {
  ShiftSwapRequest.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  ShiftSwapRequest.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  ShiftSwapRequest.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift swap request created successfully' });
  });
});

router.put('/:id', (req, res) => {
  const { status } = req.body;
  ShiftSwapRequest.getById(req.params.id, (err, request) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (status === 'approved') {
      Schedule.getByDate(request.swap_date, (err, schedules) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const requesterSchedule = schedules.find(s => s.employee_id === request.requester_id);
        const targetSchedule = schedules.find(s => s.employee_id === request.target_id);
        
        if (requesterSchedule && targetSchedule) {
          Schedule.update(requesterSchedule.id, {
            employee_id: request.target_id,
            shift_template_id: requesterSchedule.shift_template_id,
            date: requesterSchedule.date,
            status: 'confirmed'
          }, () => {});
          
          Schedule.update(targetSchedule.id, {
            employee_id: request.requester_id,
            shift_template_id: targetSchedule.shift_template_id,
            date: targetSchedule.date,
            status: 'confirmed'
          }, () => {});
        }
      });
    }
    
    ShiftSwapRequest.update(req.params.id, { status }, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Shift swap request updated successfully' });
    });
  });
});

router.delete('/:id', (req, res) => {
  ShiftSwapRequest.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift swap request deleted successfully' });
  });
});

module.exports = router;
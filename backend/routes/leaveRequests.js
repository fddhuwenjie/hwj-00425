const express = require('express');
const router = express.Router();
const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Schedule = require('../models/Schedule');

router.get('/', (req, res) => {
  LeaveRequest.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  LeaveRequest.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  LeaveRequest.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Leave request created successfully' });
  });
});

router.put('/:id', (req, res) => {
  const { status } = req.body;
  LeaveRequest.getById(req.params.id, (err, request) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (status === 'approved') {
      Schedule.getByDateRange(request.start_date, request.end_date, (err, schedules) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const employeeSchedules = schedules.filter(s => s.employee_id === request.employee_id);
        employeeSchedules.forEach(schedule => {
          Schedule.delete(schedule.id, () => {});
        });
      });
      
      if (request.type === '年假') {
        Employee.getById(request.employee_id, (err, employee) => {
          if (err) return;
          const daysDiff = Math.ceil((new Date(request.end_date) - new Date(request.start_date)) / (1000 * 60 * 60 * 24)) + 1;
          const newUsed = (employee.used_annual_leave || 0) + daysDiff;
          Employee.update(request.employee_id, { ...employee, used_annual_leave: newUsed }, () => {});
        });
      }
    }
    
    LeaveRequest.update(req.params.id, { status }, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Leave request updated successfully' });
    });
  });
});

router.delete('/:id', (req, res) => {
  LeaveRequest.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Leave request deleted successfully' });
  });
});

router.get('/employee/:employee_id', (req, res) => {
  LeaveRequest.getByEmployee(req.params.employee_id, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
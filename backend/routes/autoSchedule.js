const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Schedule = require('../models/Schedule');

router.post('/generate', (req, res) => {
  const { start_date, end_date } = req.body;
  
  db.all('SELECT * FROM employees', (err, employees) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all('SELECT * FROM shift_templates WHERE is_holiday = 0', (err, shifts) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.all('SELECT * FROM shift_requirements', (err, requirements) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const scheduleResult = generateSchedule(employees, shifts, requirements, start_date, end_date);
        saveSchedule(scheduleResult, (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Schedule generated successfully', count: scheduleResult.length });
        });
      });
    });
  });
});

function generateSchedule(employees, shifts, requirements, start_date, end_date) {
  const result = [];
  const currentDate = new Date(start_date);
  const end = new Date(end_date);
  
  const employeeStats = {};
  employees.forEach(e => {
    employeeStats[e.id] = {
      hours: 0,
      consecutiveDays: 0,
      lastShiftEnd: null,
      unavailable: JSON.parse(e.unavailable_slots || '[]')
    };
  });
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    
    shifts.forEach(shift => {
      const shiftReqs = requirements.filter(r => r.shift_template_id === shift.id);
      
      shiftReqs.forEach(req => {
        const availableEmployees = employees.filter(e => {
          if (e.position !== req.position) return false;
          
          const stats = employeeStats[e.id];
          const shiftHours = calculateHours(shift.start_time, shift.end_time);
          
          if (stats.hours + shiftHours > e.max_hours_per_week) return false;
          if (stats.consecutiveDays >= 6) return false;
          
          const isUnavailable = stats.unavailable.some(slot => {
            if (slot.day === dayOfWeek) {
              if (slot.type === 'all') return true;
              if (slot.type === 'am' && shift.start_time < '12:00') return true;
              if (slot.type === 'pm' && shift.start_time >= '12:00') return true;
            }
            return false;
          });
          if (isUnavailable) return false;
          
          if (stats.lastShiftEnd) {
            const hoursBetween = getHoursBetween(stats.lastShiftEnd, shift.start_time);
            if (hoursBetween < 8) return false;
          }
          
          return true;
        });
        
        const assigned = assignEmployees(availableEmployees, employeeStats, shift, req.min_count, dateStr);
        assigned.forEach(emp => {
          result.push({
            employee_id: emp.id,
            shift_template_id: shift.id,
            date: dateStr,
            status: 'confirmed'
          });
          
          const stats = employeeStats[emp.id];
          stats.hours += calculateHours(shift.start_time, shift.end_time);
          stats.consecutiveDays++;
          stats.lastShiftEnd = shift.end_time;
        });
      });
    });
    
    Object.keys(employeeStats).forEach(id => {
      const hasSchedule = result.some(s => s.employee_id == id && s.date === dateStr);
      if (!hasSchedule) {
        employeeStats[id].consecutiveDays = 0;
      }
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

function calculateHours(start, end) {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  return (endH - startH) + (endM - startM) / 60;
}

function getHoursBetween(endTime, startTime) {
  const [endH, endM] = endTime.split(':').map(Number);
  const [startH, startM] = startTime.split(':').map(Number);
  
  let hours = startH - endH;
  if (startH < endH) hours += 24;
  hours += (startM - endM) / 60;
  
  return hours;
}

function assignEmployees(available, stats, shift, count, date) {
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const sorted = shuffled.sort((a, b) => {
    const aStats = stats[a.id];
    const bStats = stats[b.id];
    return aStats.hours - bStats.hours;
  });
  
  return sorted.slice(0, count);
}

function saveSchedule(schedules, callback) {
  let count = 0;
  const total = schedules.length;
  
  if (total === 0) {
    callback(null);
    return;
  }
  
  schedules.forEach(schedule => {
    Schedule.create(schedule, (err) => {
      if (err) {
        callback(err);
        return;
      }
      count++;
      if (count === total) {
        callback(null);
      }
    });
  });
}

module.exports = router;
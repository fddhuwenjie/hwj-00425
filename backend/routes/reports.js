const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const db = require('../config/database');

router.get('/monthly', (req, res) => {
  const { year, month } = req.query;
  const start_date = `${year}-${String(month).padStart(2, '0')}-01`;
  const end_date = new Date(year, month, 0).toISOString().split('T')[0];
  
  db.all(`SELECT e.id as employee_id, e.name, e.position, e.hourly_wage,
                  SUM((strftime('%H', t.end_time) - strftime('%H', t.start_time)) + 
                      (strftime('%M', t.end_time) - strftime('%M', t.start_time))/60.0) as actual_hours
           FROM employees e
           LEFT JOIN schedules s ON e.id = s.employee_id
           LEFT JOIN shift_templates t ON s.shift_template_id = t.id
           WHERE s.date BETWEEN ? AND ?
           GROUP BY e.id, e.name, e.position, e.hourly_wage`,
    [start_date, end_date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const reports = rows.map(row => {
        const actual_hours = parseFloat(row.actual_hours) || 0;
        const contract_hours = 160;
        const overtime_hours = Math.max(0, actual_hours - contract_hours);
        const daily_overtime = actual_hours / 22 - 8 > 0 ? actual_hours / 22 - 8 : 0;
        const labor_cost = actual_hours * row.hourly_wage;
        
        return {
          employee_id: row.employee_id,
          name: row.name,
          position: row.position,
          actual_hours: actual_hours.toFixed(2),
          contract_hours: contract_hours,
          overtime_hours: overtime_hours.toFixed(2),
          daily_overtime: daily_overtime.toFixed(2),
          hourly_wage: row.hourly_wage,
          labor_cost: labor_cost.toFixed(2)
        };
      });
      
      res.json(reports);
    }
  );
});

router.get('/coverage', (req, res) => {
  const { year, month } = req.query;
  const start_date = `${year}-${String(month).padStart(2, '0')}-01`;
  const end_date = new Date(year, month, 0).toISOString().split('T')[0];
  
  db.all(`SELECT t.name as shift_name, sr.position, sr.min_count,
                  COUNT(DISTINCT s.employee_id) as actual_count
           FROM shift_templates t
           LEFT JOIN shift_requirements sr ON t.id = sr.shift_template_id
           LEFT JOIN schedules s ON t.id = s.shift_template_id
           WHERE s.date BETWEEN ? AND ?
           GROUP BY t.name, sr.position, sr.min_count`,
    [start_date, end_date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const coverage = rows.map(row => ({
        shift_name: row.shift_name,
        position: row.position,
        required: row.min_count,
        actual: row.actual_count || 0,
        coverage: ((row.actual_count || 0) / row.min_count * 100).toFixed(1)
      }));
      
      res.json(coverage);
    }
  );
});

router.get('/export', (req, res) => {
  const { year, month } = req.query;
  const start_date = `${year}-${String(month).padStart(2, '0')}-01`;
  const end_date = new Date(year, month, 0).toISOString().split('T')[0];
  
  db.all(`SELECT e.name, e.position, e.hourly_wage,
                  SUM((strftime('%H', t.end_time) - strftime('%H', t.start_time)) + 
                      (strftime('%M', t.end_time) - strftime('%M', t.start_time))/60.0) as actual_hours
           FROM employees e
           LEFT JOIN schedules s ON e.id = s.employee_id
           LEFT JOIN shift_templates t ON s.shift_template_id = t.id
           WHERE s.date BETWEEN ? AND ?
           GROUP BY e.id, e.name, e.position, e.hourly_wage`,
    [start_date, end_date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const data = rows.map(row => {
        const actual_hours = parseFloat(row.actual_hours) || 0;
        const contract_hours = 160;
        const overtime_hours = Math.max(0, actual_hours - contract_hours);
        const labor_cost = actual_hours * row.hourly_wage;
        
        return {
          '姓名': row.name,
          '岗位': row.position,
          '实际工时': actual_hours.toFixed(2),
          '合同工时': contract_hours,
          '加班工时': overtime_hours.toFixed(2),
          '时薪': row.hourly_wage,
          '人力成本': labor_cost.toFixed(2)
        };
      });
      
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, '月度报表');
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=月度报表_${year}年${month}月.xlsx`);
      res.send(xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
    }
  );
});

router.get('/leave-summary', (req, res) => {
  db.all(`SELECT e.id, e.name, e.position, e.annual_leave_days, e.used_annual_leave,
                  (e.annual_leave_days - e.used_annual_leave) as remaining_leave
           FROM employees e`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
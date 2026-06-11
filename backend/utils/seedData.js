const db = require('../config/database');

const employees = [
  { name: '张三', employee_id: 'EMP001', position: '收银', group_id: 1, max_hours_per_week: 40, hourly_wage: 15, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '李四', employee_id: 'EMP002', position: '收银', group_id: 1, max_hours_per_week: 40, hourly_wage: 15, annual_leave_days: 15, unavailable_slots: '[{"day":2,"type":"all"}]' },
  { name: '王五', employee_id: 'EMP003', position: '收银', group_id: 2, max_hours_per_week: 35, hourly_wage: 14, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '赵六', employee_id: 'EMP004', position: '服务', group_id: 1, max_hours_per_week: 40, hourly_wage: 16, annual_leave_days: 15, unavailable_slots: '[{"day":4,"type":"pm"}]' },
  { name: '钱七', employee_id: 'EMP005', position: '服务', group_id: 1, max_hours_per_week: 38, hourly_wage: 16, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '孙八', employee_id: 'EMP006', position: '服务', group_id: 2, max_hours_per_week: 40, hourly_wage: 15, annual_leave_days: 15, unavailable_slots: '[{"day":2,"type":"am"}]' },
  { name: '周九', employee_id: 'EMP007', position: '服务', group_id: 3, max_hours_per_week: 40, hourly_wage: 15, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '吴十', employee_id: 'EMP008', position: '厨房', group_id: 1, max_hours_per_week: 40, hourly_wage: 18, annual_leave_days: 15, unavailable_slots: '[{"day":4,"type":"all"}]' },
  { name: '郑十一', employee_id: 'EMP009', position: '厨房', group_id: 1, max_hours_per_week: 35, hourly_wage: 18, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '王十二', employee_id: 'EMP010', position: '厨房', group_id: 2, max_hours_per_week: 40, hourly_wage: 17, annual_leave_days: 15, unavailable_slots: '[{"day":2,"type":"pm"}]' },
  { name: '陈十三', employee_id: 'EMP011', position: '管理', group_id: 1, max_hours_per_week: 45, hourly_wage: 25, annual_leave_days: 20, unavailable_slots: '[]' },
  { name: '刘十四', employee_id: 'EMP012', position: '管理', group_id: 2, max_hours_per_week: 45, hourly_wage: 24, annual_leave_days: 20, unavailable_slots: '[{"day":2,"type":"all"}]' },
  { name: '杨十五', employee_id: 'EMP013', position: '收银', group_id: 3, max_hours_per_week: 38, hourly_wage: 14, annual_leave_days: 15, unavailable_slots: '[]' },
  { name: '黄十六', employee_id: 'EMP014', position: '服务', group_id: 1, max_hours_per_week: 40, hourly_wage: 16, annual_leave_days: 15, unavailable_slots: '[{"day":4,"type":"am"}]' },
  { name: '周十七', employee_id: 'EMP015', position: '厨房', group_id: 3, max_hours_per_week: 40, hourly_wage: 17, annual_leave_days: 15, unavailable_slots: '[]' }
];

function generateSchedules() {
  const schedules = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const cashiers = [1, 2, 3, 13];
  const servers = [4, 5, 6, 7, 14];
  const kitchen = [8, 9, 10, 15];
  const managers = [11, 12];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay();
    
    const shiftAssignments = [
      { shiftId: 1, positions: { '收银': 2, '服务': 2, '厨房': 2, '管理': 1 } },
      { shiftId: 2, positions: { '收银': 3, '服务': 3, '厨房': 2, '管理': 1 } },
      { shiftId: 3, positions: { '收银': 2, '服务': 2, '厨房': 2, '管理': 1 } }
    ];
    
    shiftAssignments.forEach(assignment => {
      Object.entries(assignment.positions).forEach(([position, count]) => {
        let available = [];
        if (position === '收银') available = cashiers.filter(id => canWorkOnDay(id, dayOfWeek, assignment.shiftId));
        else if (position === '服务') available = servers.filter(id => canWorkOnDay(id, dayOfWeek, assignment.shiftId));
        else if (position === '厨房') available = kitchen.filter(id => canWorkOnDay(id, dayOfWeek, assignment.shiftId));
        else if (position === '管理') available = managers.filter(id => canWorkOnDay(id, dayOfWeek, assignment.shiftId));
        
        available.slice(0, count).forEach(empId => {
          schedules.push({ employee_id: empId, shift_template_id: assignment.shiftId, date });
        });
      });
    });
  }
  
  return schedules;
}

function canWorkOnDay(empId, dayOfWeek, shiftId) {
  const unavailableSlots = {
    2: [2],
    4: { day: 4, shift: [3] },
    6: { day: 2, shift: [1] },
    8: [4],
    10: { day: 2, shift: [3] },
    12: [2],
    14: { day: 4, shift: [1] }
  };
  
  const empUnavailable = unavailableSlots[empId];
  if (!empUnavailable) return true;
  
  if (Array.isArray(empUnavailable)) {
    return !empUnavailable.includes(dayOfWeek);
  }
  
  if (empUnavailable.day === dayOfWeek) {
    if (shiftId === 1 && empUnavailable.shift.includes(1)) return false;
    if (shiftId === 3 && empUnavailable.shift.includes(3)) return false;
  }
  
  return true;
}

const insertSeedData = () => {
  db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
    if (row.count === 0) {
      employees.forEach(emp => {
        db.run(
          'INSERT INTO employees (name, employee_id, position, group_id, max_hours_per_week, hourly_wage, annual_leave_days, unavailable_slots) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [emp.name, emp.employee_id, emp.position, emp.group_id, emp.max_hours_per_week, emp.hourly_wage, emp.annual_leave_days, emp.unavailable_slots]
        );
      });
      console.log('Seed employees inserted');
    }
  });
  
  db.get('SELECT COUNT(*) as count FROM schedules', (err, row) => {
    if (row.count === 0) {
      const schedules = generateSchedules();
      schedules.forEach(schedule => {
        db.run(
          'INSERT INTO schedules (employee_id, shift_template_id, date, status) VALUES (?, ?, ?, ?)',
          [schedule.employee_id, schedule.shift_template_id, schedule.date, 'confirmed']
        );
      });
      console.log('Seed schedules inserted');
    }
  });
};

module.exports = { insertSeedData };
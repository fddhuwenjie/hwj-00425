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
};

module.exports = { insertSeedData };
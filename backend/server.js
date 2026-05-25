const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { AssetCondition, HandoverDocument, ActivityLog, MaintenanceRecord, NotificationHistory } = require('./nosql');
const models = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Sync SQL DB
sequelize.sync().then(async () => {
  console.log('SQL Database synced');
  
  const { User, Department, Category } = require('./models');

  // Seed default department if none exists
  let defaultDept = await Department.findByPk(1);
  if (!defaultDept) {
    defaultDept = await Department.create({ name: 'IT Support' });
    console.log('Created default department (IT Support)');
  }

  // Seed default admin if none exists
  const admin = await User.findOne({ where: { email: 'admin@example.com' } });
  if (!admin) {
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      DepartmentId: defaultDept.id
    });
    console.log('Created default admin user (admin@example.com / admin123)');
  }

  // Seed default category if none exists
  const category = await Category.findByPk(1);
  if (!category) {
    await Category.create({ name: 'General', description: 'Kategori Umum' });
    console.log('Created default category');
  }
});

// --- ROUTES ---

// 1. POST /api/assets
app.post('/api/assets', async (req, res) => {
  const asset = await models.Asset.create(req.body);
  res.json(asset);
});

// 2. GET /api/assets
app.get('/api/assets', async (req, res) => {
  const assets = await models.Asset.findAll({ include: [models.Category] });
  res.json(assets);
});

// 3. GET /api/assets/:id
app.get('/api/assets/:id', async (req, res) => {
  const asset = await models.Asset.findByPk(req.params.id, { include: [models.Category] });
  res.json(asset);
});

// 4. PUT /api/assets/:id
app.put('/api/assets/:id', async (req, res) => {
  await models.Asset.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

// 5. DELETE /api/assets/:id
app.delete('/api/assets/:id', async (req, res) => {
  await models.Asset.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// 6. POST /api/categories
app.post('/api/categories', async (req, res) => {
  const category = await models.Category.create(req.body);
  res.json(category);
});

// 7. GET /api/categories
app.get('/api/categories', async (req, res) => {
  const categories = await models.Category.findAll();
  res.json(categories);
});

// 8. PUT /api/categories/:id
app.put('/api/categories/:id', async (req, res) => {
  await models.Category.update(req.body, { where: { id: req.params.id } });
  res.json({ success: true });
});

// --- DEPARTMENTS ---
app.get('/api/departments', async (req, res) => {
  const depts = await models.Department.findAll();
  res.json(depts);
});

app.post('/api/departments', async (req, res) => {
  const dept = await models.Department.create(req.body);
  res.json(dept);
});

// 9. POST /api/assets/:id/conditions (NoSQL)
app.post('/api/assets/:id/conditions', (req, res) => {
  const data = { ...req.body, asset_id: req.params.id, timestamp: new Date() };
  AssetCondition.insert(data, (err, newDoc) => {
    res.json(newDoc);
  });
});

// 10. GET /api/assets/:id/conditions (NoSQL)
app.get('/api/assets/:id/conditions', (req, res) => {
  AssetCondition.find({ asset_id: req.params.id }, (err, docs) => {
    res.json(docs);
  });
});

// 11. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await models.User.findOne({ 
    where: { email, password },
    include: [models.Department] 
  });
  if (user) {
    // Basic Activity Log
    ActivityLog.insert({ action: 'login', user_id: user.id, user_email: user.email, timestamp: new Date() });
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 11b. POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, DepartmentId, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const deptId = DepartmentId || 1; // fallback to default
    const userRole = (role === 'admin' || role === 'employee') ? role : 'employee';
    const user = await models.User.create({ name, email, password, role: userRole, DepartmentId: deptId });
    ActivityLog.insert({ action: 'register', user_id: user.id, user_email: user.email, timestamp: new Date() });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. GET /api/users
app.get('/api/users', async (req, res) => {
  const users = await models.User.findAll({ include: [models.Department] });
  res.json(users);
});

// 12b. PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, password, DepartmentId } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (DepartmentId) updateData.DepartmentId = DepartmentId;
    
    await models.User.update(updateData, { where: { id: req.params.id } });
    const updatedUser = await models.User.findByPk(req.params.id, { include: [models.Department] });
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. POST /api/borrowings
app.post('/api/borrowings', async (req, res) => {
  const log = await models.BorrowingLog.create({ status: req.body.status || 'pending' });
  if (req.body.user_id) await log.setUser(req.body.user_id);
  if (req.body.asset_id) {
    await log.setAsset(req.body.asset_id);
    await models.Asset.update({ status: 'pending' }, { where: { id: req.body.asset_id } });
  }
  res.json(log);
});

// 14. GET /api/borrowings
app.get('/api/borrowings', async (req, res) => {
  const logs = await models.BorrowingLog.findAll({ include: [models.User, models.Asset] });
  res.json(logs);
});

// 15. PUT /api/borrowings/:id/status
app.put('/api/borrowings/:id/status', async (req, res) => {
  const updateData = { status: req.body.status };
  if (req.body.status === 'returned') {
    updateData.return_date = new Date();
  }
  await models.BorrowingLog.update(updateData, { where: { id: req.params.id } });
  
  const log = await models.BorrowingLog.findByPk(req.params.id);
  if (log && log.asset_id) {
    if (req.body.status === 'active') {
      await models.Asset.update({ status: 'borrowed' }, { where: { id: log.asset_id } });
    } else if (req.body.status === 'returned') {
      await models.Asset.update({ status: 'available' }, { where: { id: log.asset_id } });
    }
  }

  res.json({ success: true });
});

// 16. POST /api/borrowings/:id/handover (NoSQL)
app.post('/api/borrowings/:id/handover', (req, res) => {
  const data = { ...req.body, borrow_log_id: req.params.id, timestamp: new Date() };
  HandoverDocument.insert(data, (err, newDoc) => {
    res.json(newDoc);
  });
});

// 17. GET /api/borrowings/user/:id
app.get('/api/borrowings/user/:id', async (req, res) => {
  const logs = await models.BorrowingLog.findAll({ where: { user_id: req.params.id }, include: [models.Asset] });
  res.json(logs);
});

// --- NEW NOSQL ROUTES ---

// 18. GET /api/activity-logs
app.get('/api/activity-logs', (req, res) => {
  ActivityLog.find({}).sort({ timestamp: -1 }).exec((err, docs) => {
    res.json(docs);
  });
});

// 19. POST /api/activity-logs
app.post('/api/activity-logs', (req, res) => {
  ActivityLog.insert({ ...req.body, timestamp: new Date() }, (err, newDoc) => {
    res.json(newDoc);
  });
});

// 20. GET /api/maintenance-records
app.get('/api/maintenance-records', (req, res) => {
  MaintenanceRecord.find({}).sort({ timestamp: -1 }).exec((err, docs) => {
    res.json(docs);
  });
});

// 21. POST /api/maintenance-records
app.post('/api/maintenance-records', (req, res) => {
  MaintenanceRecord.insert({ ...req.body, timestamp: new Date() }, (err, newDoc) => {
    res.json(newDoc);
  });
});

// 22. GET /api/notifications
app.get('/api/notifications', (req, res) => {
  NotificationHistory.find({}).sort({ timestamp: -1 }).exec((err, docs) => {
    res.json(docs);
  });
});

// 23. POST /api/notifications
app.post('/api/notifications', (req, res) => {
  NotificationHistory.insert({ ...req.body, timestamp: new Date() }, (err, newDoc) => {
    res.json(newDoc);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

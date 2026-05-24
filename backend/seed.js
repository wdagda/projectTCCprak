const { sequelize, User, Asset, Category, BorrowingLog, Department } = require('./models');

async function seed() {
  // Sync dan reset tabel
  await sequelize.sync({ force: true });
  
  const dept = await Department.create({ name: 'IT Department' });
  
  const user = await User.create({
    // User ID 1 akan digunakan oleh user-app
    id: 1, 
    name: 'Andi (Karyawan)',
    email: 'andi@example.com',
    password: 'password123',
    role: 'employee',
    DepartmentId: dept.id
  });

  const cat = await Category.create({ name: 'Laptops', description: 'Work laptops' });

  const asset1 = await Asset.create({
    serial_number: 'SN-MAC-001',
    name: 'MacBook Pro M2 Asli',
    status: 'available', // Sebelum dipinjam
    purchase_date: new Date(),
    CategoryId: cat.id
  });

  // Membuat log peminjaman "pending" untuk Andi
  const log = await BorrowingLog.create({
    status: 'pending'
  });
  await log.setUser(user);
  await log.setAsset(asset1);

  console.log('Database berhasil diisi dengan data dummy!');
  process.exit(0);
}

seed();

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false,
});

// 1. Department
const Department = sequelize.define('Department', {
  name: { type: DataTypes.STRING, allowNull: false }
});

// 2. User
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'employee' } // 'admin', 'employee'
});
Department.hasMany(User);
User.belongsTo(Department);

// 3. Category
const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING }
});

// 4. Asset
const Asset = sequelize.define('Asset', {
  serial_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'available' }, // 'available', 'borrowed', 'maintenance'
  purchase_date: { type: DataTypes.DATE }
});
Category.hasMany(Asset);
Asset.belongsTo(Category);

// 5. BorrowingLog
const BorrowingLog = sequelize.define('BorrowingLog', {
  borrow_date: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  return_date: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING, defaultValue: 'pending' } // 'pending', 'active', 'returned', 'lost'
});
User.hasMany(BorrowingLog, { foreignKey: 'user_id' });
BorrowingLog.belongsTo(User, { foreignKey: 'user_id' });
Asset.hasMany(BorrowingLog, { foreignKey: 'asset_id' });
BorrowingLog.belongsTo(Asset, { foreignKey: 'asset_id' });

module.exports = {
  sequelize,
  Department,
  User,
  Category,
  Asset,
  BorrowingLog
};

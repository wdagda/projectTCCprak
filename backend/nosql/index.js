const Datastore = require('@seald-io/nedb');
const path = require('path');

// 1. Asset Conditions (NoSQL Collection)
const AssetCondition = new Datastore({
  filename: path.join(__dirname, '..', 'data_asset_conditions.db'),
  autoload: true
});

// 2. Handover Documents (NoSQL Collection)
const HandoverDocument = new Datastore({
  filename: path.join(__dirname, '..', 'data_handover_documents.db'),
  autoload: true
});

// 3. Activity Logs (NoSQL Collection)
const ActivityLog = new Datastore({
  filename: path.join(__dirname, '..', 'data_activity_logs.db'),
  autoload: true
});

// 4. Maintenance Records (NoSQL Collection)
const MaintenanceRecord = new Datastore({
  filename: path.join(__dirname, '..', 'data_maintenance_records.db'),
  autoload: true
});

// 5. Notification History (NoSQL Collection)
const NotificationHistory = new Datastore({
  filename: path.join(__dirname, '..', 'data_notification_history.db'),
  autoload: true
});

module.exports = {
  AssetCondition,
  HandoverDocument,
  ActivityLog,
  MaintenanceRecord,
  NotificationHistory
};

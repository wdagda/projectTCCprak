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

module.exports = {
  AssetCondition,
  HandoverDocument
};

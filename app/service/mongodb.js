const MongoClient = require("mongodb").MongoClient;
const Service = require("egg").Service;
let db, client;
class MongoDBService extends Service {
  async client() {
    const { app } = this;
    if (db) return db;
    client = await MongoClient.connect(app.config.database.url, {
      useNewUrlParser: true,
      authSource: "admin",
      auth: app.config.database.auth,
    });
    db = client.db(app.config.database.baseName);
    return db;
  }
  async closeClient() {
    client.close();
  }
}
module.exports = MongoDBService;

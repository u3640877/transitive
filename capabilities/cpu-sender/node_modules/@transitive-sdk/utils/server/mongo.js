const MongoClient = require('mongodb').MongoClient;

const URL = process.env.MONGO_URL || 'mongodb://localhost';
const DB_NAME = process.env.MONGO_DB || 'transitive';

class Mongo {

  init(onConnect) {
    this.client = new MongoClient(URL, {useUnifiedTopology: true});

    // Use connect method to connect to the server
    this.client.connect((err) => {
      if (!err) {
        this._db = this.client.db(DB_NAME);
        console.log(`Connected successfully to mongodb server ${URL}, db: ${DB_NAME}`);
        onConnect?.(this);
      } else {
        console.error('Error connecting to mongodb', err);
      }
    });
  }

  close() {
    this.client.close();
  }

  get db() {
    if (this._db == undefined) {
      console.warn('Cannot access DB before init() is called');
    }
    return this._db;
  }
}

const instance = new Mongo;
module.exports = instance;

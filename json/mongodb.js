const MongoClient = require('mongodb').MongoClient

class Mongo {
  constructor() {
    this._url = 'mongodb://localhost:27017'
    this._dbName = 'crawl-reddit-user-comments'
    this._db = false
    this._client = false
  }

  close () {
    if (this._client) this._client.close()
  }

  getDB () {
    return new Promise((resolve, reject) => {
      if (this._db) {
        resolve(this._db)
      } else {
        MongoClient.connect(this._url,(err, client) => {
          if (err) {
            reject(err)
          } else {
            this._client = client
            this._db = client.db(this._dbName)
            resolve(this._db)
          }
        })
      }
    })
  }
}

module.exports = new Mongo()

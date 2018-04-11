// node --max-old-space-size=8192 sort_authors
const MongoClient = require('mongodb').MongoClient
const md5 = require('md5')

class Mongo {
  constructor(name) {
    this._url = 'mongodb://localhost:27017'
    this._dbName = name
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

var temp_sort = new Mongo('temp-sort')
var temp_sort_az = new Mongo('temp-sort-az')

function get(page) {
  temp_sort_az.getDB().then(db_temp_sort_az => {
    temp_sort.getDB().then(db_temp_sort => {
      let start = Date.now()
      console.log('start')
      db_temp_sort.collection('author_subreddit_2017_00000000000' + page).find({}, {_id: -1, author: 1, subreddit: 1}).toArray((err, docs) => {
        if (err) console.log(err)
        else {
          console.log('pull', Date.now() - start)

          let az_db = {}
          docs.forEach(d => {
            let md5_author = md5(d.author)
            var first_letter = md5_author.charAt(0).toLowerCase()
            if (!az_db[first_letter]) az_db[first_letter] = []
            az_db[first_letter].push(d)
          })
          console.log('sort', Date.now() - start)

          let preload = Object.keys(az_db).length
          let postload = 0

          Object.keys(az_db).forEach(az => {
            db_temp_sort_az.collection(az).insertMany(az_db[az], (err, results) => {
              if (err) console.error(err)

              postload++
              console.log(az, Date.now() - start)

              if (preload == postload && page < 9) {
                setTimeout(() => {
                  let pull_end = Date.now()
                  let pull_time = pull_end - start
                  console.log('page:', page, 'time:', pull_time / 1000)
                  get(page + 1)
                }, 0)
              }
            })
          })

        }
      })
    })
  })
}

get(0)

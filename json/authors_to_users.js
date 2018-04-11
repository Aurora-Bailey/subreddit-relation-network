// node --max-old-space-size=8192 authors_to_users
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

function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}

var temp_sort_az = new Mongo('temp-sort-az')
var bigquery_reddit = new Mongo('bigquery-reddit')
let collections = ["a","b","c","d","e","f","0","1","2","3","4","5","6","7","8","9"]

function get(index) {
  if (index >= collections.length) return false
  let collection = collections[index]
  temp_sort_az.getDB().then(db_temp_sort_az => {
    bigquery_reddit.getDB().then(db_bigquery_reddit => {
      let start = Date.now()
      console.log('start', collection)
      db_temp_sort_az.collection(collection).find({}, {_id: -1, author: 1, subreddit: 1}).toArray((err, docs) => {
        if (err) console.log(err)
        else {
          console.log('pull', Date.now() - start)

          let reddit_users_object = {}
          // {Snoo: {username: 'Snoo', subreddits: ['AskReddit', 'IAmA', ...]}, ...}
          docs.forEach(d => {
            try {
              let author = d.author
              if (!isNaN(author)) {
                author = toFixed(author)
              } else if (author.match(/[^a-zA-Z0-9_-]/)) {
                if (author == '[deleted]') return false
                console.log(author)
                author = author.replace(/[^a-zA-Z0-9_-]/g, '')
                if (author.length < 2) author = "too_short_" + Math.floor(Math.random() * 100000000)
              }
              if (typeof reddit_users_object[author] !== 'object') reddit_users_object[author] = {username: author, subreddits: []}
              reddit_users_object[author].subreddits.push(d.subreddit)
            } catch (e) {
              console.error(e)
              console.log(d)
            }
          })
          console.log('sort', Date.now() - start)

          let users_array = []
          // [{username: 'Snoo', subreddits: ['AskReddit', 'IAmA', ...]}, {...}]
          Object.keys(reddit_users_object).forEach(user => {
            users_array.push(reddit_users_object[user])
          })
          console.log('condense', Date.now() - start)

          db_bigquery_reddit.collection('username_subreddits').insertMany(users_array, (err, results) => {
            if (err) console.error(err)

            let pull_end = Date.now()
            let pull_time = pull_end - start
            console.log('collection:', collection, 'index:', index, 'time:', pull_time / 1000)

            setTimeout(() => {
              get(index + 1)
            }, 0)
          })

        }
      })
    })
  })
}

get(0)

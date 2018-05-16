const axios = require('axios')
const isNode = require('detect-node')

class API {
  constructor () {
    this.start = Date.now()
    this.cache = {}
    this.loadedAll = false
    this.preloadOverflow = []
    this.runPreload = (process.env.NODE_ENV === 'production')
  }

  preload () {
    return new Promise((resolve, reject) => {
      if (isNode && !this.loadedAll) {
        this.loadedAll = true
        console.log(`pull EVERYTHING from S3`)
        axios.get(`https://s3-us-west-2.amazonaws.com/related-subreddits-86775957/index/subreddit_data.json`).then((res) => {
          this.cache = res.data
          resolve()
          this.preloadOverflow.forEach(resolveOthers => {
            resolveOthers()
          })
        }).catch((err) => {
          reject(err)
        })
      } else if (this.loadedAll) {
        console.log(`push request to overflow`)
        this.preloadOverflow.push(resolve)
      }
    })
  }

  getSubredditData (subreddit) {
    return new Promise((resolve, reject) => {
      if (typeof this.cache[subreddit] !== 'undefined') {
        console.log(`pull ${subreddit} from cache`)
        resolve(this.cache[subreddit])
      } else {
        if (isNode && this.runPreload) {
          this.preload().then(() => {
            this.getSubredditData(subreddit).then(data => {
              resolve(data)
            }).catch(err => { reject(err) })
          }).catch(err => { reject(err) })
        } else {
          console.log(`pull ${subreddit} from S3`)
          axios.get(`https://s3-us-west-2.amazonaws.com/related-subreddits-86775957/data/${subreddit}.json`).then((res) => {
            this.cache[subreddit] = res.data
            resolve(res.data)
          }).catch((err) => {
            reject(err)
          })
        }
      }
    })
  }
}

var api = new API()
export default api

// data/subreddit.json
// {
//   "subreddit": "Blink182",
//   "commenters": 1400,
//   "x_subs": {
//     "subreddits": [],
//     "cross_commenters": [],
//     "commenters": [],
//     "rank_child": [],
//     "rank_parent": [],
//     "rank_combined": [],
//     "public_description": [],
//     "subscribers": [],
//     "over18": []
//   },
//   "products": {
//     "asin": [],
//     "name": [],
//     "comment": [],
//     "count": []
//   },
//   "description": "",
//   "public_description": "",
//   "subscribers": 23274,
//   "accounts_active": 178,
//   "created_utc": 1287061704
// }

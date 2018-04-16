const fs = require('fs')
const rimraf = require('rimraf')
const MongoDB = require('./mongodb')
const bigquery_reddit = new MongoDB('bigquery-reddit')

class Gen {
  constructor () {
    this.subreddit_list_cache = false
    this.user_cache = false
    this.run()
  }

  run () {
    this.clearDatabase().then(() => {
      this.writeSubredditsToNuxtRoutes().then(() => {
        this.usersToSubreddits().then(x => {
          fs.writeFileSync('dump.txt', JSON.stringify(x.programming))
          console.log('done!')
          bigquery_reddit.close()
        }).catch(err => {console.error(err)})
      }).catch(err => {console.error(err)})
    }).catch(err => {console.error(err)})
  }

  writeSubredditsToNuxtRoutes () {
    return new Promise((resolve, reject) => {
      this.pullSubredditList().then(s => {
        let routes = []
        s.forEach(e => {
          routes.push('/r/' + e)
        })
        fs.writeFile('./db/routes/index.json', JSON.stringify({count: routes.length, last_update: Date.now(), routes}), err => {
          if (err) reject(err)
          else resolve()
        })
      }).catch(err => {reject(err)})
    })
  }

  // ['subreddit', 'subreddit']
  pullSubredditList () {
    return new Promise((resolve, reject) => {
      if (this.subreddit_list_cache) {
        console.log('Pulling subreddit list from memory')
        resolve(this.subreddit_list_cache)
      } else {
        bigquery_reddit.getDB().then(db => {
          db.collection('subreddits_2017').find({'commenters': {$gte: 100}}, {_id: 0, subreddit: 1}).toArray((err, docs) => {
            if (err) reject(err)
            else {
              let list = []
              docs.forEach(e => {
                list.push(e.subreddit)
              })
              this.subreddit_list_cache = list
              resolve(list)
            }
          })
        }).catch(err => {reject(err)})
      }
    })
  }

  // Not used atm
  // pullSubreddits () {
  //   return new Promise((resolve, reject) => {
  //     bigquery_reddit.getDB().then(db => {
  //       db.collection('subreddits').find({'about.subscribers': {$gte: 1000000}}).toArray((err, docs) => {
  //         if (err) reject(err)
  //         else {
  //           resolve(docs)
  //         }
  //       })
  //     }).catch(err => {reject(err)})
  //   })
  // }

  // subNetwork () {
  //   return new Promise((resolve, reject) => {
  //     this.commentsToUsers().then(users => {
  //     }).catch(err => {reject(err)})
  //   })
  // }

  // {sports: { subreddit: 'sports', subscribers: 538, crosscomment: {gifs: { subreddit: 'gifs', commenters: 334}, {...}}, avg_commenters_in_other_subs: 6.897435897435898 }, {...}}
  usersToSubreddits () {
    return new Promise((resolve, reject) => {
      this.commentsToUsers().then(users => {
        let subreddits_object = {}

        Object.keys(users).forEach(username => {
          let user = users[username]
          user.subreddits.forEach(subreddit => {
            if (!subreddits_object[subreddit]) subreddits_object[subreddit] = {subreddit, commenters: 0, crosscomment: {}}
            subreddits_object[subreddit].commenters++
            user.subreddits.forEach(sr => {
              if (sr == subreddit) return false
              if (!subreddits_object[subreddit].crosscomment[sr]) subreddits_object[subreddit].crosscomment[sr] = {subreddit: sr, commenters: 0}
              subreddits_object[subreddit].crosscomment[sr].commenters++
            })
          })
        })

        // add avg_commenters_in_other_subs
        let subreddits_object_keys = Object.keys(subreddits_object)
        let num_subreddits = subreddits_object_keys.length
        subreddits_object_keys.forEach(subreddit => {
          subreddits_object[subreddit].avg_commenters_in_other_subs = subreddits_object[subreddit].commenters / (num_subreddits -1)
        })

        // add crosscomment significance
        subreddits_object_keys.forEach(subreddit => {
          Object.keys(subreddits_object[subreddit].crosscomment).forEach(cross_subreddit => {
            let significance = subreddits_object[subreddit].crosscomment[cross_subreddit].commenters / subreddits_object[cross_subreddit].avg_commenters_in_other_subs
            subreddits_object[subreddit].crosscomment[cross_subreddit].significance = significance
          })
        })
        // same person can point back from multiple subs
        resolve(subreddits_object)
      }).catch(err => {reject(err)})
    })
  }

  // [{username: 'Snoo', subreddits: ['AskReddit', 'IAmA', ...]}, ...]
  pullUsers () {
    return new Promise((resolve, reject) => {
      if (this.user_cache) {
        console.log('Pulling users from memory')
        resolve(this.user_cache)
      } else {
        bigquery_reddit.getDB().then(db => {
          db.collection('username_subreddits').find({}, {_id: -1, username: 1, subreddits: 1}).toArray((err, docs) => {
            if (err) reject(err)
            else {
              this.user_cache = docs
              resolve(docs)
            }
          })
        }).catch(err => {reject(err)})
      }
    })
  }

  clearDatabase () {
    return new Promise((resolve, reject) => {
      this.dropDatabase().then(() => {
        this.createDatabase().then(() => {
          resolve()
        }).catch(err => {reject(err)})
      }).catch(err => {reject(err)})
    })
  }

  dropDatabase () {
    return new Promise((resolve, reject) => {
      rimraf('./db', err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  createDatabase() {
    return new Promise((resolve, reject) => {
      this.mkdir('./db').then(() => {
        this.mkdir('./db/routes').then(() => {
          this.mkdir('./db/subreddits').then(() => {
            resolve()
          }).catch(err => {reject(err)})
        }).catch(err => {reject(err)})
      }).catch(err => {reject(err)})
    })
  }

  mkdir (dir) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  // not used atm
  // paginate (itemsPerPage, array) {
  //   let r = []
  //   let chunk = []
  //   let page = 1
  //   array.forEach(item => {
  //     chunk.push(item)
  //     if (chunk.length >= itemsPerPage) {
  //       r.push({chunk, page})
  //       chunk = []
  //       page++
  //     }
  //   })
  //   if (chunk.length > 0) r.push({chunk, page}) // catch the extra items
  //   return r
  // }
}

var gen = new Gen()

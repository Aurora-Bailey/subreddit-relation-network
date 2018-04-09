const fs = require('fs')
const rimraf = require('rimraf')
const mongo = require('./mongodb')

class Gen {
  constructor () {
    this.subreddit_list_cache = false
    this.comment_cache = false
    this.run()
  }

  run () {
    this.clearDatabase().then(() => {
      this.writeSubredditsToNuxtRoutes().then(() => {
        this.userSubsToSubPopularity().then(x => {
          console.log(x)
          console.log('done!')
          mongo.close()
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
        mongo.getDB().then(db => {
          db.collection('subreddits').find({'about.subscribers': {$gte: 1000000}}, {subreddit: 1}).toArray((err, docs) => {
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
  //     mongo.getDB().then(db => {
  //       db.collection('subreddits').find({'about.subscribers': {$gte: 1000000}}).toArray((err, docs) => {
  //         if (err) reject(err)
  //         else {
  //           resolve(docs)
  //         }
  //       })
  //     }).catch(err => {reject(err)})
  //   })
  // }

  // [{sub: 'subreddit', num_users: 123}]
  userSubsToSubPopularity () {
    return new Promise((resolve, reject) => {
      this.commentsToUserSubs().then(user_subs => {
        let subs_array = []
        let subreddits = {}
        user_subs.forEach(user => {
          user.subs.forEach(sub => {
            if (!subreddits[sub]) subreddits[sub] = 0
            subreddits[sub]++
          })
        })
        Object.keys(subreddits).forEach(sub => {
          subs_array.push({sub, num_users: subreddits[sub]})
        })
        subs_array.sort((a, b) => {
          if (a.num_users == b.num_users) return 0
          return a.num_users > b.num_users ? 1 : -1
        })
        resolve(subs_array)
      }).catch(err => {reject(err)})
    })
  }

  // [{user: 'username', subs: ['subreddit', 'subs']}]
  commentsToUserSubs () {
    return new Promise((resolve, reject) => {
      this.pullComments().then(comments => {
        let username_subreddits = []
        let users_object = {}

        comments.forEach(comment => {
          if (!users_object[comment.author]) users_object[comment.author] = {}
          users_object[comment.author][comment.subreddit] = true
        })
        Object.keys(users_object).forEach(user => {
          let subreddits = Object.keys(users_object[user])
          username_subreddits.push({user, subs: subreddits})
        })

        // filter out single subreddit users
        username_subreddits = username_subreddits.filter(user => user.subs.length > 1)

        resolve(username_subreddits)
      }).catch(err => {reject(err)})
    })
  }

  // [{author: 'username', subreddit: 'subreddit'}]
  pullComments () {
    return new Promise((resolve, reject) => {
      if (this.comment_cache) {
        console.log('Pulling comments from memory')
        resolve(this.comment_cache)
      } else {
        this.pullSubredditList().then(subreddit_list => {
          mongo.getDB().then(db => {
            db.collection('comments').find({subreddit: {$in: subreddit_list}}, {_id: -1, author: 1, subreddit: 1}).toArray((err, docs) => {
              if (err) reject(err)
              else {
                this.comment_cache = docs
                resolve(docs)
              }
            })
          }).catch(err => {reject(err)})
        }).catch(err => {reject(err)})
      }
    })
  }

  // Not used atm
  // pullAllComments () {
  //   return new Promise((resolve, reject) => {
  //     mongo.getDB().then(db => {
  //       db.collection('comments').find({}).toArray((err, docs) => {
  //         if (err) reject(err)
  //         else {
  //           resolve(docs)
  //         }
  //       })
  //     }).catch(err => {reject(err)})
  //   })
  // }

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

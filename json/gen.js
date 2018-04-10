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
        this.usersToSubreddits().then(x => {
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

  // subNetwork () {
  //   return new Promise((resolve, reject) => {
  //     this.commentsToUsers().then(users => {
  //     }).catch(err => {reject(err)})
  //   })
  // }

  subNetwork () {
    return new Promise((resolve, reject) => {
      this.commentsToUsers().then(users => {
        this.usersToSubreddits().then(popular => {
          resolve(popular)
        }).catch(err => {reject(err)})
      }).catch(err => {reject(err)})
    })
  }

  // {sports: { subreddit: 'sports', subscribers: 538, users_avg_other_subs: 6.897435897435898 }, {...}}
  usersToSubreddits () {
    return new Promise((resolve, reject) => {
      this.commentsToUsers().then(users => {
        let subreddits_object = {}

        Object.keys(users).forEach(username => {
          let user = users[username]
          user.subreddits.forEach(subreddit => {
            if (!subreddits_object[subreddit]) subreddits_object[subreddit] = {subreddit, commenters: 0}
            subreddits_object[subreddit].commenters++
          })
        })
        let subreddits_object_keys = Object.keys(subreddits_object)
        let num_subreddits = subreddits_object_keys.length
        subreddits_object_keys.forEach(subreddit => {
          subreddits_object[subreddit].avg_commenters_in_other_subs = subreddits_object[subreddit].commenters / (num_subreddits -1)
        })
        resolve(subreddits_object)
      }).catch(err => {reject(err)})
    })
  }

  // {Snoo: { username: 'Snoo', subreddits: [ 'askscience', 'AskReddit' ] }, {...}}
  commentsToUsers () {
    return new Promise((resolve, reject) => {
      this.pullComments().then(comments => {
        let users_object = {}
        comments.forEach(comment => {
          if (!users_object[comment.author]) users_object[comment.author] = {username: comment.author, subreddits: {}}
          users_object[comment.author]['subreddits'][comment.subreddit] = true
        })
        // users_object == {username: {username: 'username', subreddits: {asdf: true, qwer: true}}, {...}}
        Object.keys(users_object).forEach(user => {
          // convert subreddits from object to array
          users_object[user].subreddits = Object.keys(users_object[user].subreddits)
          // remove users with only one subscription
          if (users_object[user].subreddits.length < 2) delete users_object[user]
        })
        // users_object == {username: {username: 'username', subreddits: ['asdf', 'qwer']}, {...}}

        resolve(users_object)
      }).catch(err => {reject(err)})
    })
  }

  // [{author: 'Snoo', subreddit: 'AskReddit'}]
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

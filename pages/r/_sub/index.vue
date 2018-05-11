<template>
  <v-container fluid pa-0 v-scroll="onScroll">
    <v-layout column>
      <v-flex mb-5>
        <v-jumbotron color="primary darken-4">
          <v-container pa-0>
            <v-layout row wrap align-center justify-center>
              <v-flex xs12 sm11 md11 lg10 xl8 py-4>
                <v-card color="primary darken-4" class="white--text" flat>
                  <v-card-title primary-title class="headline">r/{{subreddit}}</v-card-title>
                  <v-card-text>
                    <div>
                      <b>{{numberWithCommas(commenters)}}</b> users commented on <b>r/{{subreddit}}</b>
                    </div>
                    <div>
                      <a class="white--text" :href="'https://reddit.com/r/' + subreddit">{{'https://reddit.com/r/' + subreddit}}</a>
                    </div>

                    <v-radio-group v-model="sort_by_percent" label="Sort By" column dark>
                      <v-radio color="primary" label="Percent of this subreddit" value="from"></v-radio>
                      <v-radio color="secondary" label="Percent of the other subreddit" value="to"></v-radio>
                      <v-radio color="accent" label="Combined" value="combined"></v-radio>
                    </v-radio-group>
                  </v-card-text>
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-jumbotron>
      </v-flex>
      <v-flex mb-5>
        <v-container pa-0>
          <v-layout row wrap align-center justify-center>
            <v-flex xs12 sm11 md11 lg10 xl8 mb-2 v-for="sub in x_subs_pretty_paginate" :key="x_subs_pretty.subreddits">
              <v-card nuxt :to="'/r/' + sub.subreddits" hover>
                <v-card-title class="headline">r/{{sub.subreddits}} <v-spacer></v-spacer> <v-chip v-if="sub.over18" color="red" label outline>NSFW</v-chip><v-subheader>{{abbreviateNumber(sub.subscribers)}} subscribers</v-subheader></v-card-title>
                <v-card-text>
                  <div v-html="sub.public_description"></div>

                  <!-- <div><b>{{numberWithCommas(sub.commenters)}}</b> users commented on <b>r/{{sub.subreddits}}</b></div>
                  <div><b>{{numberWithCommas(sub.cross_commenters)}}</b> users commented on both <b>r/{{subreddit}}</b> and <b>r/{{sub.subreddits}}</b></div>
                  <div><b>{{roundNumber(sub.percent_of_mother_sub, 2)}}%</b> of users who commented on <b>r/{{subreddit}}</b> also commented on <b>r/{{sub.subreddits}}</b></div>
                  <div><b>{{roundNumber(sub.percent_of_child_sub, 2)}}%</b> of users who commented on <b>r/{{sub.subreddits}}</b> also commented on <b>r/{{subreddit}}</b></div> -->

                  <div style="position: relative">
                    <v-progress-linear :height="30" :value="(100 / (sub.percent_of_mother_sub + sub.percent_of_child_sub)) * sub.percent_of_mother_sub" color="primary" background-color="secondary"></v-progress-linear>
                    <div style="position: absolute; top: 0; bottom: 0; left: 24px; color: white; z-index: 1; line-height: 30px"><b>{{subreddit}}</b> {{roundNumber(sub.percent_of_mother_sub, 2)}}%</div>
                    <div style="position: absolute; top: 0; bottom: 0; right: 24px; color: white; z-index: 1; line-height: 30px">{{roundNumber(sub.percent_of_child_sub, 2)}}% <b>{{sub.subreddits}}</b></div>
                  </div>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<style>
</style>

<script>
  import axios from 'axios'

  function percent (small, big) {
    return (small / big) * 100
  }

  export default {
    data () {
      return {
        sort_by_percent: 'to',
        paginate: 10,
        paginate_by: 10
      }
    },
    methods: {
      paginateLoad () {
        this.paginate += this.paginate_by
      },
      onScroll (e) {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop
        let viewHeight = window.innerHeight || document.documentElement.clientHeight
        let pageHeight = document.documentElement.scrollHeight || document.documentElement.offsetHeight
        let scrollBottom = scrollTop + viewHeight

        if (scrollBottom === pageHeight) this.paginateLoad()
      },
      numberWithCommas (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      },
      abbreviateNumber (value) {
        var newValue = value
        if (value >= 1000) {
          var suffixes = ['', 'k', 'm', 'b', 't']
          var suffixNum = Math.floor(('' + value).length / 3)
          var shortValue = ''
          for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision))
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
            if (dotLessShortValue.length <= 2) {
              break
            }
          }
          // if (shortValue % 1 !== 0) shortNum = shortValue.toFixed(1)
          newValue = shortValue + suffixes[suffixNum]
        }
        return newValue
      },
      roundNumber (x, decimal) {
        return Math.floor(x * Math.pow(10, decimal)) / Math.pow(10, decimal)
      },
      percent (small, big) {
        return (small / big) * 100
      }
    },
    computed: {
      x_subs_pretty () {
        let arr = []
        this.x_subs.subreddits.forEach((subreddit, index) => {
          let objectify = {}
          Object.keys(this.x_subs).forEach(key => {
            objectify[key] = this.x_subs[key][index]
          })

          objectify['percent_of_child_sub'] = percent(objectify['cross_commenters'], objectify['commenters'])
          objectify['percent_of_mother_sub'] = percent(objectify['cross_commenters'], this.commenters)
          arr.push(objectify)
        })

        // sort
        if (this.sort_by_percent === 'from') {
          arr.sort((a, b) => {
            if (a.percent_of_mother_sub === b.percent_of_mother_sub) return 0
            return a.percent_of_mother_sub > b.percent_of_mother_sub ? -1 : 1
          })
        } else if (this.sort_by_percent === 'to') {
          arr.sort((a, b) => {
            if (a.percent_of_child_sub === b.percent_of_child_sub) return 0
            return a.percent_of_child_sub > b.percent_of_child_sub ? -1 : 1
          })
        }

        return arr
      },
      x_subs_pretty_paginate () {
        return this.x_subs_pretty.slice(0, this.paginate)
      }
    },
    async asyncData ({params, error, payload}) {
      return axios.get(`https://s3-us-west-2.amazonaws.com/related-subreddits-30508031/${params.sub}.json`).then((res) => {
        return res.data
      }).catch((e) => {
        error({ statusCode: 404, message: 'Page not found' })
      })
    }
  }
</script>

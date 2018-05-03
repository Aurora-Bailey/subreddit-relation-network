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
                      <b>{{numberWithCommas(c)}}</b> users commented on <b>r/{{subreddit}}</b>
                    </div>
                    <div>
                      <b>{{numberWithCommas(x_subs_pretty.length)}}</b> related subreddits found
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
            <v-flex xs12 sm11 md11 lg10 xl8 mb-2 v-for="sub in x_subs_pretty_paginate" :key="x_subs_pretty.subreddit">
              <v-card nuxt :to="'/r/' + sub.subreddit" hover>
                <v-card-title class="headline">r/{{sub.subreddit}}</v-card-title>
                <v-card-text>
                  <div><b>{{numberWithCommas(sub.commenters)}}</b> users commented on <b>r/{{sub.subreddit}}</b></div>
                  <div><b>{{numberWithCommas(sub.overlap)}}</b> users commented on both <b>r/{{subreddit}}</b> and <b>r/{{sub.subreddit}}</b></div>
                  <div><b>{{roundNumber(sub.percent_of_mother_sub, 2)}}%</b> of users who commented on <b>r/{{subreddit}}</b> also commented on <b>r/{{sub.subreddit}}</b></div>
                  <div><b>{{roundNumber(sub.percent_of_child_sub, 2)}}%</b> of users who commented on <b>r/{{sub.subreddit}}</b> also commented on <b>r/{{subreddit}}</b></div>

                  <div style="position: relative">
                    <div style="position: absolute; top: 0; bottom: 0; left: 24px; color: white; z-index: 2; line-height: 20px"><b>Combined</b> {{roundNumber(sub.percent_combined, 2)}}%</div>
                    <v-progress-linear :height="20" :value="percent(sub.percent_combined - percent_combined_max_min.min, percent_combined_max_min.max  - percent_combined_max_min.min)" color="accent"></v-progress-linear>
                  </div>

                  <div style="position: relative">
                    <div style="position: absolute; top: 0; bottom: 0; left: 24px; color: white; z-index: 2; line-height: 30px"><b>{{subreddit}}</b> {{roundNumber(sub.percent_of_mother_sub, 2)}}%</div>
                    <div style="position: absolute; top: 0; bottom: 0; right: 24px; color: white; z-index: 2; line-height: 30px">{{roundNumber(sub.percent_of_child_sub, 2)}}% <b>{{sub.subreddit}}</b></div>
                    <v-progress-linear :height="30" :value="(100 / sub.percent_combined) * sub.percent_of_mother_sub" color="primary" background-color="secondary"></v-progress-linear>
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
      roundNumber (x, decimal) {
        return Math.floor(x * Math.pow(10, decimal)) / Math.pow(10, decimal)
      },
      percent (small, big) {
        return (small / big) * 100
      }
    },
    computed: {
      percent_combined_max_min () {
        let max = 0
        let min = 100000
        this.x_subs_pretty.forEach(sub => {
          if (sub.percent_combined > max) max = sub.percent_combined
          if (sub.percent_combined < min) min = sub.percent_combined
        })
        return {max, min}
      },
      x_subs_pretty () {
        let arr = []
        Object.keys(this.x_subs).forEach(sub => {
          arr.push({
            subreddit: sub,
            commenters: this.x_subs[sub].c,
            overlap: this.x_subs[sub].x,
            percent_of_mother_sub: percent(this.x_subs[sub].x, this.c),
            percent_of_child_sub: percent(this.x_subs[sub].x, this.x_subs[sub].c),
            percent_combined: (percent(this.x_subs[sub].x, this.c) + percent(this.x_subs[sub].x, this.x_subs[sub].c))
          })
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
        } else if (this.sort_by_percent === 'combined') {
          arr.sort((a, b) => {
            if (a.percent_combined === b.percent_combined) return 0
            return a.percent_combined > b.percent_combined ? -1 : 1
          })
        }
        return arr
      },
      x_subs_pretty_paginate () {
        return this.x_subs_pretty.slice(0, this.paginate)
      }
    },
    async asyncData ({params, error, payload}) {
      return axios.get(`https://s3.amazonaws.com/related-subreddits-49148307/${params.sub}.json`).then((res) => {
        // res.data == { subreddit: 'AskReddit', c: 283611, x_subs:{
        //   worldnews: {c: 80549, x: 2616},
        //   todayilearned: {c: 95618, x: 3425},
        // }}
        return res.data
      }).catch((e) => {
        error({ statusCode: 404, message: 'Page not found' })
      })
    }
  }
</script>

<template>
  <v-container class="pl-0 pr-0 pt-5 pb-5">
    <v-layout row wrap align-center justify-center>
      <v-flex xs12 sm11 md11 lg10 xl8 text-xs-center>
        <v-card>
          <v-card-text>
            <nuxt-link v-for="subreddit in subredditList" :key="subreddit" :to="'/r/' + subreddit + '/'">r/{{subreddit}}</nuxt-link>
            <!-- <v-chip color="primary" >
            </v-chip> -->
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    head () {
      return {
        title: `Subreddit list - reddit.guide`,
        meta: [
          { hid: 'description', name: 'description', content: `The full list of all the subreddits we have in our data` },
          { hid: 'og:description', property: 'og:description', content: `The full list of all the subreddits we have in our data` },
          { hid: 'og:title', property: 'og:title', content: `Subreddit list - reddit.guide` },
          { hid: 'og:url', property: 'og:url', content: `https://reddit.guide/r/` }
        ]
      }
    },
    computed: {
      subredditList () { return this.$store.state.subredditList }
    }
  }
</script>

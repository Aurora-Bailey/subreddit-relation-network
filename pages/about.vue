<template>
  <v-container class="pl-0 pr-0 pt-5 pb-5">
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6>
        <v-card>
         <v-card-title class="headline">About</v-card-title>
         <v-card-text>
           <p>Have you ever wondered if you're missing out on a subreddit? That's why we created "reddit.guide", to find subreddits like others, unbiased, without relying on subreddit description links.</p>
           <p>It works by pulling comments from reddit and connecting users who comment on multiple subreddits to build a map of subreddits with overlaping commenters. Subreddits are then ranked by what percent of one subreddit comments on another.</p>
         </v-card-text>
         <v-card-actions>
           <v-spacer></v-spacer>
           <v-btn color="primary" flat nuxt to="/r/">List of all subreddits</v-btn>
         </v-card-actions>
       </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    head () {
      return {
        title: `About - reddit.guide`,
        meta: [
          { hid: 'description', name: 'description', content: `Find out more about reddit.guide` },
          { hid: 'og:description', property: 'og:description', content: `Find out more about reddit.guide` },
          { hid: 'og:title', property: 'og:title', content: `About - reddit.guide` },
          { hid: 'og:url', property: 'og:url', content: `https://reddit.guide/about/` }
        ]
      }
    }
  }
</script>

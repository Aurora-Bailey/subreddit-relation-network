<template>
  <v-app light>
    <!-- navigation drawer -->
    <v-navigation-drawer v-model="drawer" fixed app>
      <v-list>
        <v-list-tile router :to="item.to" :key="i" v-for="(item, i) in drawer_links" exact>
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!-- tool bar -->
    <v-toolbar v-if="!searching" :scroll-threshold="50" scroll-off-screen fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <nuxt-link to="/">
        <v-toolbar-title v-text="title" class="ml-3 mr-3 grey--text text--darken-3"></v-toolbar-title>
      </nuxt-link>
      <v-spacer class="hidden-sm-and-up"></v-spacer>
      <v-select :items="subredditList" v-model="selectSubreddit" label="search" class="hidden-xs-only ml-4 mr-4" autocomplete flat solo-inverted prepend-icon="search"></v-select>
      <v-btn class="hidden-sm-and-up" @click="searching = true" icon><v-icon>search</v-icon></v-btn>
    </v-toolbar>
    <!-- mobile search bar -->
    <v-toolbar v-if="searching" fixed app>
      <!-- <v-text-field flat solo-inverted append-icon="close" :append-icon-cb="() => {searching = false}" label="find subreddit" class="ml-2 mr-2"></v-text-field> -->
      <v-select :items="subredditList" v-model="selectSubreddit" label="search" class="ml-2 mr-2" autocomplete flat solo-inverted append-icon="close" :append-icon-cb="() => {searching = false}"></v-select>
    </v-toolbar>
    <!-- main content -->
    <v-content>
      <nuxt />
    </v-content>
    <!-- footer -->
    <v-footer height="auto" inset absolute app>
      <v-card flat tile color="secondary"class="white--text text-xs-center" width="100%">
        <v-card-text class="white--text pa-4">
          &copy;{{year}} <strong>{{title}}</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        year: (new Date()).getFullYear(),
        selectSubreddit: '',
        drawer: false,
        searching: false,
        drawer_links: [
          { icon: 'home', title: 'home', to: '/' },
          { icon: 'info', title: 'about', to: '/about/' }
          // { icon: 'whatshot', title: 'AskReddit', to: '/r/AskReddit' },
          // { icon: 'whatshot', title: 'aww', to: '/r/aww' },
          // { icon: 'whatshot', title: 'todayilearned', to: '/r/todayilearned' },
          // { icon: 'whatshot', title: 'EarthPorn', to: '/r/EarthPorn' },
          // { icon: 'whatshot', title: 'books', to: '/r/books' },
          // { icon: 'whatshot', title: 'mildlyinteresting', to: '/r/mildlyinteresting' },
          // { icon: 'whatshot', title: 'Art', to: '/r/Art' },
          // { icon: 'whatshot', title: 'Fitness', to: '/r/Fitness' }
        ],
        title: 'reddit.guide'
      }
    },
    computed: {
      subredditList () { return this.$store.state.subredditList }
    },
    watch: {
      selectSubreddit () {
        if (this.selectSubreddit === '') return false
        this.$router.push({
          path: '/r/' + this.selectSubreddit
        })
        setTimeout(() => {
          this.selectSubreddit = ''
          this.searching = false
        }, 0)
      }
    }
  }
</script>

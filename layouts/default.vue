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
      <v-toolbar-title v-text="title" class="ml-3 mr-3"></v-toolbar-title>
      <v-spacer class="hidden-sm-and-up"></v-spacer>
      <v-select :items="subredditList" v-model="selectSubreddit" label="Find Subreddit" class="hidden-xs-only ml-4 mr-4" autocomplete flat solo-inverted prepend-icon="search"></v-select>
      <v-btn class="hidden-sm-and-up" @click="searching = true" icon><v-icon>search</v-icon></v-btn>
    </v-toolbar>
    <!-- mobile search bar -->
    <v-toolbar v-if="searching" fixed app>
      <!-- <v-text-field flat solo-inverted append-icon="close" :append-icon-cb="() => {searching = false}" label="Find Subreddit" class="ml-2 mr-2"></v-text-field> -->
      <v-select :items="subredditList" v-model="selectSubreddit" label="Find Subreddit" class="ml-2 mr-2" autocomplete flat solo-inverted append-icon="close" :append-icon-cb="() => {searching = false}"></v-select>
    </v-toolbar>
    <!-- main content -->
    <v-content>
      <nuxt />
    </v-content>
    <!-- footer -->
    <v-footer height="auto" inset absolute app>
      <v-card flat tile color="secondary darken-2"class="white--text text-xs-center">
        <v-card-text class="white--text">
          Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum. Praesent ut risus eget metus luctus accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a sit amet dui. Duis commodo vitae velit et faucibus. Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </v-card-text>
        <v-card-text class="white--text">
          &copy;2018 — <strong>Vuetify</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
  export default {
    data () {
      return {
        selectSubreddit: '',
        drawer: false,
        searching: false,
        drawer_links: [
          { icon: 'apps', title: 'Welcome', to: '/' },
          { icon: 'bubble_chart', title: 'Inspire', to: '/inspire' },
          { icon: 'bubble_chart', title: 'AskReddit', to: '/r/AskReddit' },
          { icon: 'bubble_chart', title: 'aww', to: '/r/aww' }
        ],
        title: 'Related Subreddits'
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

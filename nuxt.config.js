const axios = require('axios')

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'subreddit-relation-network',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js + Vuetify.js project' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: ['~/plugins/vuetify.js'],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Generate static routes
  */
  generate: {
    routes: function () {
      return axios.get('https://reddit.guide/index/subreddit_list.json')
      .then((res) => {
        return res.data.list.filter(subreddit => {
          return !subreddit.includes(':')
        }).map((subreddit) => {
          return '/r/' + subreddit
        })
      })
    }
  },
  /*
  ** Disable prefetch and preload.
  */
  render: {
    resourceHints: false
  },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      '~/plugins/vuetify.js',
      '~/my_modules/api.js',
    ],
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}

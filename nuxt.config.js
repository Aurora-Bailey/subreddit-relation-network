const axios = require('axios')

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Find new subreddits - reddit.guide',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Find new subreddits related to the ones you already like.' },
      { hid: 'og:description', property: 'og:description', content: `Find new subreddits related to the ones you already like.` },
      { hid: 'og:title', property: 'og:title', content: `Find new subreddits - reddit.guide` },
      { hid: 'og:url', property: 'og:url', content: `https://reddit.guide/` },
      { hid: 'og:type', property: 'og:type', content: `website` },
      { hid: 'og:site_name', property: 'og:site_name', content: `reddit.guide` },
      { hid: 'og:image', property: 'og:image', content: `https://reddit.guide/favicon.ico` },
      { hid: 'twitter:card', property: 'twitter:card', content: `summary` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  plugins: [
    '~/plugins/vuetify.js',
    { src: '~/plugins/localStorage.js', ssr: false }],
  modules: [
    ['@nuxtjs/google-analytics', { id: 'UA-119546324-1' }]
  ],
  css: [
    '~/assets/style/app.styl'
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#FF5722' },
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

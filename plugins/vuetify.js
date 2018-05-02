import Vue from 'vue'
import Vuetify from 'vuetify'

// Helpers
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  theme: {
    primary: colors.lightBlue.base,
    secondary: colors.deepOrange.base,
    accent: colors.green.base
  }
})

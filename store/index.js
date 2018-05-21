import api from '~/my_modules/api'

export const state = () => ({
  subredditList: []
})

export const mutations = {
  setSubredditList (state, list) {
    state.subredditList = list
  }
}

export const actions = {
  async nuxtServerInit ({ commit }) {
    let { list } = await api.getSubredditList()
    commit('setSubredditList', list)
  }
}

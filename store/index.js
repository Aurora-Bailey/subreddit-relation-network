import api from '~/my_modules/api'

export const state = () => ({
  sortSubreddits: 'combined',
  subredditList: []
})

export const mutations = {
  setSortSubreddits (state, value) {
    state.sortSubreddits = value
  },
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

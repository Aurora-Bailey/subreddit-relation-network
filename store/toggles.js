export const state = () => ({
  sortSubreddits: 'combined',
  showProducts: true,
  showComments: true
})

export const mutations = {
  setSortSubreddits (state, value) {
    state.sortSubreddits = value
  },

  setShowProducts (state, value) {
    state.showProducts = value
  },
  setShowComments (state, value) {
    state.showComments = value
  }
}

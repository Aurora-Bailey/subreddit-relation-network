export const state = () => ({
  sortSubreddits: 'combined'
})

export const mutations = {
  setSortSubreddits (state, value) {
    state.sortSubreddits = value
  }
}

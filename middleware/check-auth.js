import { getUserFromCookie, getUserFromLocalStorage } from '~/utils'

export default function ({ store, request }) {
  if (process.server && !request) return

  const userData = process.server ? getUserFromCookie(request) : getUserFromLocalStorage()
  if (!userData) {

  } else if (!userData.jwt || Date.now() > userData.expiresIn) {
    store.commit('clearToken')
    store.commit('clearUser')
  } else {
    store.commit('setToken', userData.jwt)
    store.commit('setUser', { email: userData.user, avatar: userData.avatar })
    const timeToLogout = userData.expiresIn - Date.now()
    store.dispatch('setLogoutTimer', timeToLogout)
  }
}

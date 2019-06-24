import md5 from 'md5'
import db from '~/plugins/firestore'
import { saveUserData, clearUserData } from '~/utils'
import slugify from 'slugify'
import unidecode from 'unidecode'
import defaultImage from '~/assets/default-image.jpg'

export const state = {
  headlines: [],
  headline: null,
  category: '',
  loading: false,
  country: 'jp',
  token: '',
  user: null,
  feed: [],
  source: ''
}

export const getters = {
  headlines: state => state.headlines,
  headline: state => state.headline,
  category: state => state.category,
  loading: state => state.loading,
  country: state => state.country,
  isAuthenticated: state => !!state.token,
  user: state => state.user,
  feed: state => state.feed,
  source: state => state.source
}

export const actions = {
  async loadHeadlines({ commit }, apiUrl) {
    commit('setLoading', true)
    const { articles } = await this.$axios.$get(apiUrl)
    const headlines = articles.map((article) => {
      const slug = slugify(unidecode(article.title), {
        replacement: '-',
        remove: /[^a-zA-Z0-9 -]/g,
        lower: true
      })
      // 画像がない場合、デフォルトを適用
      if (!article.urlToImage) {
        article.urlToImage = defaultImage
      }
      const headline = { ...article, slug }
      return headline
    })

    commit('setLoading', false)
    commit('setHeadlines', headlines)
  },
  async addHeadlineToFeed({ state }, headline) {
    const feedRef = db.collection(`users/${state.user.email}/feed`).doc(headline.title)
    await feedRef.set(headline)
  },
  async sendComment({ commit, state }, comment) {
    const commentRef = db.collection(`headlines/${state.headline.slug}/comments`)
    commit('setLoading', true)
    await commentRef.doc(comment.id).set(comment)
    await commentRef.orderBy('likes', 'desc').get().then((querySnapShot) => {
      const comments = []
      querySnapShot.forEach((doc) => {
        comments.push(doc.data())
        const updatedHeadline = { ...state.headline, comments }
        commit('setHeadline', updatedHeadline)
      })
    })
    commit('setLoading', false)
  },
  async removeHeadlineFromFeed({ state }, headline) {
    const headlineRef = db.collection(`users/${state.user.email}/feed`).doc(headline.title)
    await headlineRef.delete()
  },
  async likeComment({ state, commit }, commentId) {
    const commentsRef = db.collection(`headlines/${state.headline.slug}/comments`)
      .orderBy('likes', 'desc')

    const likedCommentRef = db.collection('headlines').doc(state.headline.slug)
      .collection('comments').doc(commentId)
    await likedCommentRef.get().then((doc) => {
      if (doc.exists) {
        const prevLikes = doc.data().likes
        const currentLikes = prevLikes + 1
        likedCommentRef.update({
          likes: currentLikes
        })
      }
    })

    await commentsRef.onSnapshot((querySnapShot) => {
      const loadedComments = []
      querySnapShot.forEach((doc) => {
        loadedComments.push(doc.data())
        const updatedHeadline = {
          ...state.headline,
          comments: loadedComments
        }
        commit('setHeadline', updatedHeadline)
      })
    })
  },
  async saveHeadline(context, headline) {
    const headlineRef = db.collection('headlines').doc(headline.slug)

    let headlineId
    await headlineRef.get().then((doc) => {
      if (doc.exists) {
        headlineId = doc.id
      }
    })

    if (!headlineId) {
      await headlineRef.set(headline)
    }
  },
  async loadHeadline({ commit }, headlineSlug) {
    const headlineRef = db.collection('headlines').doc(headlineSlug)
    const commentsRef = db.collection(`headlines/${headlineSlug}/comments`).orderBy('likes', 'desc')

    let loadedHeadline = {}
    await headlineRef.get().then(async (doc) => {
      if (doc.exists) {
        loadedHeadline = doc.data()

        await commentsRef.get().then((querySnapShot) => {
          if (querySnapShot.empty) {
            commit('setHeadline', loadedHeadline)
          }
          const loadedComments = []
          querySnapShot.forEach((doc) => {
            loadedComments.push(doc.data())
            loadedHeadline.comments = loadedComments
            commit('setHeadline', loadedHeadline)
          })
        })
      }
    })
  },
  async authenticateUser({ commit }, userPayload) {
    try {
      commit('setLoading', true)
      const authUserData = await this.$axios.$post(`/${userPayload.action}/`, {
        email: userPayload.email,
        password: userPayload.password,
        returnSecureToken: userPayload.returnSecureToken
      })
      // eslint-disable-next-line no-console
      console.log(authUserData)

      let user
      if (userPayload.action === 'register') {
        const avatar = `http://gravatar.com/avatar/${md5(authUserData.email)}?d=identicon`
        user = { email: authUserData.email, avatar }

        await db.collection('users').doc(authUserData.email).set(user)
      } else if (userPayload.action === 'login') {
        const loginRef = db.collection('users').doc(userPayload.email)
        const loggedInUser = await loginRef.get()
        user = loggedInUser.data()
      }

      commit('setUser', user)
      commit('setToken', authUserData.idToken)
      commit('setLoading', false)
      saveUserData(authUserData, user)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      commit('setLoading', false)
    }
  },
  async loadUserFeed({ state, commit }) {
    if (state.user) {
      const feedRef = db.collection(`users/${state.user.email}/feed`)

      await feedRef.onSnapshot((querySnapshot) => {
        const headlines = []
        querySnapshot.forEach((doc) => {
          headlines.push(doc.data())
          commit('setFeed', headlines)
        })

        // これが無いと最後の１つが消せない
        if (querySnapshot.empty) {
          commit('setFeed', [])
        }
      })
    }
  },
  setLogoutTimer({ dispatch }, interval) {
    setTimeout(() => dispatch('logoutUser'), interval)
  },
  logoutUser({ commit }) {
    commit('clearToken')
    commit('clearUser')
    commit('clearFeed')
    clearUserData()
  }
}

export const mutations = {
  setHeadlines(state, headlines) {
    state.headlines = headlines
  },
  setCategory(state, category) {
    state.category = category
  },
  setHeadline(state, headline) {
    state.headline = headline
  },
  setLoading(state, loading) {
    state.loading = loading
  },
  setCountry(state, country) {
    state.country = country
  },
  setToken(state, token) {
    state.token = token
  },
  setUser(state, user) {
    state.user = user
  },
  setFeed(state, headlines) {
    state.feed = headlines
  },
  setSource(state, source) {
    state.source = source
  },
  clearToken(state) {
    state.token = ''
  },
  clearUser(state) {
    state.user = null
  },
  clearFeed(state) {
    state.feed = []
  }
}

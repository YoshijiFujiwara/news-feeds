
export default {
  mode: 'spa',

  router: {
    middleware: 'check-auth'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons' }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#9ccc65', height: '10px' },
  /*
  ** Global CSS
  */
  css: [
    { src: 'vue-material/dist/vue-material.min.css', lang: 'css' },
    { src: '~/assets/theme.scss', lang: 'scss' }
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/vue-material' },
    { src: '~/plugins/axios' },
    { src: '~/plugins/firestore' },
    { src: '~/plugins/time-filters' }
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/eslint-module',
    '@nuxtjs/proxy',
    'nuxt-fontawesome'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    credentials: true,
    proxy: true
  },

  proxy: {
    '/api/': {
      target: 'https://newsapi.org/v2/',
      pathRewrite: { '^/api/': '' }
    },
    '/register/': {
      target: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=YOUR_KEY`,
      pathRewrite: { '^/register/': '' }
    },
    '/login/': {
      target: `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=YOUR_KEY`,
      pathRewrite: { '^/login/': '' }
    }
  },

  env: {
    NEWS_API_KEY: 'YOUR_KEY',
    FIREBASE_APIKEY: 'YOUR_KEY',
    AUTH_DOMAIN: 'YOUR_KEY',
    DATABASE_URL: 'YOUR_URL',
    PROJECT_ID: 'YOUR_KEY',
    STORAGE_BUCKET: 'YOUR_KEY',
    MESSAGINGSENDERID: 'YOUR_KEY',
    APP_ID: 'YOUR_KEY'
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },

  fontawesome: {
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: ['fas']
      }
    ]
  }
}

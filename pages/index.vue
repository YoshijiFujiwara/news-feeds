<template lang="pug">
  .md-layout.md-alignment-center(style="margin: 4em 0")
    // トップナビゲーション
    md-toolbar.fixed-toolbar(elevation="1")
      md-button.md-icon-button(@click="showLeftSidePanel = true")
        md-icon menu
      nuxt-link.md-primary.md-title(to='/') なくすとニュース
      .md-toolbar-section-end
        template(v-if="isAuthenticated")
          md-button
            md-avatar
              img(:src="user.avatar" :alt="user.email")
            | {{ user.email }}
          md-button(@click="logoutUser") ログアウト
        template(v-else)
          md-button(@click="$router.push('/login')"): font-awesome-icon(icon="sign-in-alt")
          md-button(@click="$router.push('/register')"): font-awesome-icon(icon="user-plus")
        md-button.md-primary(@click="showSearchDialog = true"): md-icon search

        md-button.md-accent(@click="showRightSidePanel = true"): md-icon category

    // 検索モーダル
    md-dialog(:md-active.sync="showSearchDialog")
      md-dialog-title 記事を検索
      .md-layout(style="padding: 1em")
        md-field
          label 検索するワード
          md-input(v-model="query" placeholder="AND / OR / NOT で複数ワードを指定できます" maxlength="30")
        md-datepicker(v-model="fromDate" md-immediately): label 日付で絞り込み(この日以降の記事) ※選ばなくてもいい
        md-datepicker(v-model="toDate" md-immediately): label 日付で絞り込み(この日までの記事) ※選ばなくてもいい
        md-field
          label(for="sortBy") 並び順
          md-select(v-model="sortBy" name="sortBy" id="sortBy" md-dense)
            md-option(value="publishedAt") 新着順
            md-option(value="relevancy") 関連順
            md-option(value="popularity") 人気順
      md-dialog-actions
        md-button.md-accent(@click="showSearchDialog = false") キャンセル
        md-button.md-primary(@click="searchHeadlines") 検索
    // プログレスバー
    md-progress-bar(v-if="loading" md-mode='indeterminate')

    // パーソナル(左のパネル)
    md-drawer(md-fixed :md-active.sync="showLeftSidePanel")
      md-toolbar(md-elevation="1")
        span.md-title パーソナルフィード
      md-progress-bar(v-if="loading" md-mode="indeterminate")
      md-field
        label(for="country") 国
        md-select(@input="changeCountry" :value="country" name="country" id="country")
          md-option(value="jp") 日本
          md-option(value="us") アメリカ
          md-option(value="ca") カナダ
          md-option(value="de") ドイツ
          md-option(value="ru") ロシア
      // feedが無い時
      md-empty-state.md-primary(v-if="feed.length === 0 && !user"
                                    md-icon="bookmarks" md-label="フィードがありません" md-description="ログインして、記事をブックマークしよう")
        md-button(@click="$router.push('/login')").md-primary.md-raised ログイン
      md-empty-state.md-accent(v-else-if="feed.length === 0"
                                  md-icon="bookmark_outline"
                                  md-label="フィードがありません"
                                  md-description="ブックマークしたものは、こちらに保存されます")
      // feed
      md-list.md-triple-line(v-else-if v-for="(headline, index) in feed" :key="index")
        md-list-item
          md-avatar: img(:src="headline.urlToImage" :alt="headline.title")
          .md-list-item-text
            span: a(:href="headline.url" target="_blank") {{ headline.title }}
            span {{ headline.source.name }}
            span(@click="saveHeadline(headline)") コメント
          md-button.md-icon-button.md-list-action(@click="removeHeadlineFromFeed(headline)")
            md-icon.md-accent delete
        md-divider.md-inset
    // ニュースカテゴリー サイドパネル
    md-drawer.md-right(md-fixed :md-active.sync="showRightSidePanel")
      md-toolbar(:md-elevation="1")
        span.md-title ニュースカテゴリー

      md-list
        md-subheader.md-primary カテゴリー一覧
        md-list-item(v-for="(newsCategory, index) in newsCategories" :key="index"
          @click="loadCategory(newsCategory.path)")
          md-icon(:class="newsCategory.path === category ? 'md-primary' : ''") {{ newsCategory.icon }}
          span.md-list-item-text {{ newsCategory.name }}

    // コンテンツ
    .md-layout-item.md-size-95
      md-content.md-layout.md-gutter(style="background: #dddddd; padding: 1em;")
        ul.md-layout-item.md-size-50.md-xlarge-size-25.md1-large-size-30.md-medium-size-33.md-small-size-50.md-xsmall-size-100(v-for="headline in headlines" :key="headline.id")
          md-card(style="margin-top: 1em;" md-with-hover)
            md-ripple
              md-card-media(md-ratio="16:9")
                img(:src="headline.urlToImage" :alt="headline.title")
              md-card-header
                .md-title
                  a(:href="headline.url" target="_blank") {{ headline.title }}
                div(@click="loadSource(headline.source.id)")
                  | {{ headline.source.name }}
                  md-icon.small-icon book
                .md-subhead(v-if="headline.author")
                  | {{ headline.author }}
                  md-icon.small-icon face
                .md-subhead
                  | {{ headline.publishedAt | publishedTimeToNow }}
                  md-icon.small-icon alerm
              md-card-content {{ headline.description }}
              md-card-actions
                md-button.md-icon-button(@click="addHeadlineToFeed(headline)" :class="isInFeed(headline.title)")
                  md-icon bookmark
                md-button.md-icon-button.md-icon-button(@click="saveHeadline(headline)")
                  md-icon message

</template>

<script>
export default {
  data() {
    return {
      showLeftSidePanel: false,
      showRightSidePanel: false,
      showSearchDialog: false,
      newsCategories: [
        { name: 'トップニュース', path: '', icon: 'today' },
        { name: 'テクノロジー', path: 'technology', icon: 'keyboard' },
        { name: 'ビジネス', path: 'business', icon: 'business_center' },
        { name: 'エンタメ', path: 'entertainment', icon: 'weekend' },
        { name: 'ヘルス', path: 'health', icon: 'fastfood' },
        { name: 'サイエンス', path: 'science', icon: 'fingerprint' },
        { name: 'スポーツ', path: 'sports', icon: 'golf_course' }
      ],

      query: '',
      fromDate: '',
      toDate: '',
      sortBy: ''
    }
  },
  computed: {
    headlines() {
      return this.$store.getters.headlines
    },
    category() {
      return this.$store.getters.category
    },
    loading() {
      return this.$store.getters.loading
    },
    country() {
      return this.$store.getters.country
    },
    user() {
      return this.$store.getters.user
    },
    feed() {
      return this.$store.getters.feed
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    source() {
      return this.$store.getters.source
    }
  },
  watch: {
    async country() {
      await this.$store.dispatch('loadHeadlines', `/api/top-headlines?country=${this.country}&category=${this.category}`)
    }
  },
  async fetch({ store }) {
    await store.dispatch('loadHeadlines', `/api/top-headlines?country=${store.state.country}&category=${store.state.category}`)
    await store.dispatch('loadUserFeed')
  },
  methods: {
    async loadCategory(category) {
      this.$store.commit('setCategory', category)
      await this.$store.dispatch('loadHeadlines', `/api/top-headlines?country=${this.country}&category=${this.category}`)
    },
    async loadSource(sourceId) {
      if (sourceId) {
        await this.$store.commit('setSource', sourceId)
        await this.$store.dispatch('loadHeadlines', `/api/top-headlines?sources=${this.source}`)
      }
    },
    async saveHeadline(headline) {
      await this.$store.dispatch('saveHeadline', headline)
        .then(() => {
          this.$router.push(`/headlines/${headline.slug}`)
        })
    },
    changeCountry(country) {
      this.$store.commit('setCountry', country)
    },
    logoutUser() {
      this.$store.dispatch('logoutUser')
    },
    async searchHeadlines() {
      await this.$store.dispatch('loadHeadlines', `/api/everything?q=${this.query}
      &from=${this.dateToISOString(this.fromDate)}&to=${this.dateToISOString(this.toDate)}
      &sortBy=${this.sortBy}`)
      this.showSearchDialog = false
    },
    async addHeadlineToFeed(headline) {
      if (this.user) {
        await this.$store.dispatch('addHeadlineToFeed', headline)
      }
    },
    isInFeed(title) {
      const inFeed = this.feed.findIndex(headline => headline.title === title) > -1
      return inFeed ? 'md-primary' : ''
    },
    async removeHeadlineFromFeed(headline) {
      await this.$store.dispatch('removeHeadlineFromFeed', headline)
    },
    dateToISOString(date) {
      if (date) {
        return new Date(date).toISOString()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .small-icon {
    font-size: 18px !important;
  }

  .fixed-toolbar {
    position: fixed;
    top: 0;
    z-index: 5;
  }
</style>

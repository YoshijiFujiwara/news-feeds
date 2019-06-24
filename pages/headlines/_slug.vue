<template lang="pug">
  .md-layout.md-alignment-center(style="margin: 5em 0")
    .md-layout-item.md-size-75.md-small-size-80.md-xsmall-size-100
      md-card
        md-card-media(style="height: 300px" md-ratio="16:9"): img(:src="headline.urlToImage" :alt="headline.title")
        md-card-header
          .md-title: a(:href="headline.url" target="_blank") {{ headline.title }}
          div
            | {{ headline.source.name }}
            md-icon book
          span.md-subhead(v-if="headline.author")
            | {{ headline.author }}
            md-icon face
        md-card-content {{ headline.content }}

      // form
      form(@submit.prevent="sendComment")
        md-field
          label コメントを追加
          md-textarea(v-model="text" :disabled="loading || !user")
          md-icon description
        md-button.md-primary.md-raised(type="submit" :disabled="loading || !user") コメントを送信

      // コメント
      md-list.md-triple-line(style="margin-top: 1em")
        md-list-item(v-for="(comment, index) in headline.comments" :key="index")
          md-avatar: img(:src="comment.user.avatar" :alt="comment.user.username")
          .md-list-item-text
            span {{ comment.user.username }}
            span {{ comment.publishedAt | commentTimeToNow }}
            p {{ comment.text }}
          md-badge.md-primary(md-position="bottom" :md-content="comment.likes")
            md-button.md-icon-button(:disabled="loading || !user" @click="likeComment(comment.id)")
              md-icon thumb_up
      // 戻るボタン
      md-button.md-fab.md-fab-bottom-right.md-fixed.md-primary(@click="$router.go(-1)")
        md-icon arrow_back
</template>

<script>
import uuidv4 from 'uuid/v4'

export default {
  data() {
    return {
      text: ''
    }
  },
  computed: {
    headline() {
      return this.$store.getters.headline
    },
    loading() {
      return this.$store.getters.loading
    },
    user() {
      return this.$store.getters.user
    }
  },
  async fetch({ store, params }) {
    await store.dispatch('loadHeadline', params.slug)
  },
  methods: {
    async sendComment() {
      const comment = {
        id: uuidv4(),
        text: this.text,
        user: this.getCommentUserData(),
        publishedAt: Date.now(),
        likes: 0
      }
      await this.$store.dispatch('sendComment', comment)
      this.text = ''
    },
    getCommentUserData() {
      const commentUserData = { ...this.user }
      // eslint-disable-next-line no-console
      console.log(commentUserData)
      commentUserData.username = commentUserData.email.split('@')[0]
      return commentUserData
    },
    async likeComment(commentId) {
      await this.$store.dispatch('likeComment', commentId)
    }
  }
}
</script>

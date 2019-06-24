<template lang="pug">
  .md-layout.md-alignment-center-center(style="height: 100vh!")
    md-card.md-layout-item.md-size-50(style="margin-top: 5em")
      md-card-header
        .md-title ログイン
        h3 テストユーザー(email: 「test@test.com」, pass: 「secret」)でログインできます
      form(@submit.prevent="validateForm")
        md-card-content
          md-field(md-clearable :class="getValidationClass('email')")
            label(for="email") メールアドレス
            md-input(:disabled="loading" type="email" name="email" id="email" autocomplete="email" v-model="form.email")
            span.md-error(v-if="!$v.form.email.required") メールアドレスは必須です
            span.md-error(v-else-if="!$v.form.email.email") 形式が正しくありません
          md-field(:class="getValidationClass('password')")
            label(for="password") パスワード
            md-input(:disabled="loading" type="password" name="password" id="password" autocomplete="password" v-model="form.password")
            span.md-error(v-if="!$v.form.password.required") パスワードは必須です
            span.md-error(v-else-if="!$v.form.password.minLength") パスワードは５文字以上必要です
            span.md-error(v-else-if="!$v.form.password.maxLength") パスワードは２０文字以内です
        md-card-actions
          md-button(@click="$router.push('/register')") ユーザー登録へ
          md-button.md-primary.md-raised(:diabled="loading" type="submit") ログイン
      md-snackbar(:md-active.sync="isAuthenticated") {{ form.email }} はログインできました！
    // ホーム画面へ
    md-button.md-fab.md-fab-bottom-right.md-fixed.md-primary(@click="$router.push('/')")
      md-icon home
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  middleware: 'auth',
  mixins: [validationMixin],
  data() {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },
  validations: {
    form: {
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(5),
        maxLength: maxLength(20)
      }
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    }
  },
  watch: {
    isAuthenticated(value) {
      if (value) {
        setTimeout(() => {
          this.$router.push('/')
        }, 500)
      }
    }
  },
  methods: {
    validateForm() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.loginUser()
      }
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]
      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    async loginUser() {
      await this.$store.dispatch('authenticateUser', {
        action: 'login',
        email: this.form.email,
        password: this.form.password,
        returnSecureToken: true
      })
    }
  }
}
</script>

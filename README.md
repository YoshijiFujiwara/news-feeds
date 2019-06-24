# news-feed
ニュースフィードSPAです。 公開URL:https://nuxt-news-yoshiji.herokuapp.com/  
使用した主な技術は、Nuxt.jsとFirestoreです。以下の点にフィーチャーしました。
* Firebaseのログイン、ユーザー登録機能を活用
* Vuexステートを使用
* CSSフレームワークには、Vue Materialを使用
* ニュースフィード、コメントの保存にFirestoreを使用
* ニュースの取得は、https://newsapi.org/ を使用
* デプロイにはherokuを使用

## 動作確認
git cloneした後、
```
yarn install
yarn run dev
```
localhost:3000で確認できます。

import Vue from 'vue'
import { distanceInWordsToNow } from 'date-fns'

const changeToJapaneseTime = (time) => {
  time = time.replace('about', 'およそ')
  time = time.replace(' a ', '1')
  time = time.replace('less', '')
  time = time.replace('than', '')
  time = time.replace('half', '')

  time = time.replace('seconds', '秒')
  time = time.replace('minutes', '分')
  time = time.replace('hours', '時間')
  time = time.replace('days', '日')
  time = time.replace('years', '年')

  time = time.replace('second', '秒')
  time = time.replace('minute', '分')
  time = time.replace('hour', '時間')
  time = time.replace('day', '日')
  time = time.replace('year', '年')
  time = time.replace(' ', '')
  return time
}

Vue.filter('publishedTimeToNow', (time) => {
  const japaneseTime = changeToJapaneseTime(distanceInWordsToNow(time))
  return `${japaneseTime}前`
})

Vue.filter('commentTimeToNow', (timestamp) => {
  const timeElapsed = distanceInWordsToNow(timestamp, {
    includeSeconds: true
  })
  // 英語表記を日本語にする
  const japaneseTime = changeToJapaneseTime(timeElapsed)
  return `${japaneseTime}前`
})

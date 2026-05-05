import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import App from './App.vue'
import './assets/styles/main.css'
import zh from './locales/zh'
import en from './locales/en'

const pinia = createPinia()

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages: { zh, en }
})

const app = createApp(App)
app.use(pinia)
app.use(i18n)

// Sync locale from persisted settings
import { useSettingsStore } from '@/stores/settingsStore'
const settingsStore = useSettingsStore()
settingsStore.loadFromStorage()
i18n.global.locale.value = settingsStore.locale

app.mount('#app')

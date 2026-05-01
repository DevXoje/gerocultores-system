import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
// Firebase init: connects to emulators in DEV, uses VITE_* env vars in all envs (G05 compliant)
import '@/infrastructure/firebase/firebase'
import App from './App.vue'
import router from './router/router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
// Firebase init: connects to emulators in DEV, uses VITE_* env vars in all envs (G05 compliant)
import './services/firebase'
import App from './App.vue'
import router from './router/router'
import { useAuthStore } from './business/auth/useAuthStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// US-01 (TC-06): Restore auth session before mounting so the router guard (US-02)
// has a valid user state. Prevents authenticated routes from flashing /login on reload.
const authStore = useAuthStore()
await authStore.init()

app.mount('#app')

import { createApp } from 'vue'
import './style.css'
import './services/firebase' // Initialize Firebase + connect emulators in DEV
import App from './App.vue'

createApp(App).mount('#app')

import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes/index'

const app = express()

// --- Middleware ---
// CORS: in production, restrict origins via CORS_ORIGIN env var (see .env.example)
app.use(cors({ origin: process.env['CORS_ORIGIN'] || '*' }))
app.use(express.json())

// --- Routes ---
app.use(routes)

// --- Error handler (must be last) ---
app.use(errorHandler)

export default app

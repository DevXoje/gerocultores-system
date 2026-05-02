import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes/index'

export const PORT = process.env['APP_PORT'] ?? 3000
export const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? '*'
export const NODE_ENV = process.env['NODE_ENV'] ?? 'development'

const app = express()

// --- Middleware ---
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// --- Routes ---
app.use(routes)

// --- Error handler (must be last) ---
app.use(errorHandler)

export default app

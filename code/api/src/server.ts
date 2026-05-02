import 'dotenv/config'

import app from './app'

const PORT = Number(process.env['APP_PORT'] ?? 3000)
const HOST = process.env['HOST'] ?? 'localhost'

app.listen(PORT, HOST, () => {
  console.log(`[server] API running on http://${HOST}:${PORT}`)
})
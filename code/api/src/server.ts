import 'dotenv/config'

import app from './app'

const PORT = process.env['PORT'] ?? 3000
const HOST = process.env['HOST'] ?? 'localhost'

app.listen(PORT, () => {
  console.log(`[server] API running on http://${HOST}:${PORT}`)
})
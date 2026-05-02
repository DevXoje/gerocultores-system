import { setGlobalOptions } from "firebase-functions"
import { onRequest } from "firebase-functions/https"
import * as logger from "firebase-functions/logger"

import app from "./app"

// Cost control: max 10 concurrent cold starts
// Protects against unexpected traffic spikes
setGlobalOptions({ maxInstances: 10, region: "europe-west1" })

logger.info("Cloud Function api started")

// Export Express app as HTTP Cloud Function
export const api = onRequest(app)
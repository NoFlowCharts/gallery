import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config })
await payload.db.migrate()
process.exit(0)
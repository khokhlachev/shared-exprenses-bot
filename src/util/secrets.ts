import dotenv from "dotenv"
import fs from "fs"

if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" })
} else {
  dotenv.config({ path: ".env.local" })
}
export const ENV = process.env.NODE_ENV

export const SUPABASE_URL = process.env.SUPABASE_URL!
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export const ALLOWED_TG_ID = [185625876, 136068023]

const notifications: string[] = []
;["SUPABASE_URL", "SUPABASE_ANON_KEY", "TELEGRAM_BOT_TOKEN"].forEach((k) => {
  if (!process.env[k]) {
    notifications.push(`Set ${k} environment variable.`)
  }
})

if (notifications.length > 0) {
  console.error(notifications.join("\n"))
  process.exit(1)
}

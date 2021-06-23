import { createClient } from "@supabase/supabase-js"
import { Telegraf, Context } from "telegraf"
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TELEGRAM_BOT_TOKEN,
  ALLOWED_TG_ID,
  BOT_URL,
} from "./util/secrets"
import formatNumber from "./util/formatNumber"
import {
  HELP_MESSAGE,
  STORE_ABBR,
  TG_ID_USERNAME,
  MONTH_NAME_RUS,
} from "./constants"

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const BOT_HOOK_PATH = `/bot${TELEGRAM_BOT_TOKEN}`
const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
bot
  .launch({
    webhook: BOT_URL
      ? {
          domain: BOT_URL,
          hookPath: BOT_HOOK_PATH,
          port,
        }
      : undefined,
  })
  .catch((err) => {
    console.error(err)
    throw new Error("Launch failed")
  })

bot.start((ctx) => {
  ctx.reply(`Ну привет!`)
})

bot.use((ctx, next) => {
  const fromId = ctx.from?.id

  if (!fromId || !ALLOWED_TG_ID.includes(fromId)) {
    return ctx.reply(`${fromId} unauthorized`)
  } else {
    return next()
  }
})

bot.catch((err, ctx) => {
  console.error(err)
  ctx.reply(`Упс. Ошибка`)
})

bot.help((ctx) => ctx.reply(HELP_MESSAGE))

bot.command("abbr", (ctx) => {
  ctx.reply(
    Object.keys(STORE_ABBR).reduce((acc, k) => {
      return acc + `${k}: ${STORE_ABBR[k]}\n`
    }, "")
  )
})

async function handleReport(ctx: Context, viewName: string) {
  const { data, error } = await supabase.from(viewName).select()

  if (error) {
    throw new Error(error.toString())
  }

  if (!data) {
    throw new Error("No data")
  }

  const byMonth = data.reduce((acc, obj) => {
    acc[obj.mon] ? acc[obj.mon].push(obj) : (acc[obj.mon] = [obj])
    return acc
  }, {})

  const responseText = Object.keys(byMonth).reduce(
    (acc: string, k: string, i) => {
      for (const monthData of byMonth[k]) {
        acc += `В ${MONTH_NAME_RUS[monthData.mon - 1]} ${
          TG_ID_USERNAME[monthData.from_tg_id]
        } *${formatNumber(monthData.Sum)} ₽*\n`
      }

      if (i > 0) {
        acc += "\n"
      }

      return acc
    },
    ""
  )

  return ctx.replyWithMarkdown(responseText)
}

bot.command("month", async (ctx) => {
  return handleReport(ctx, "sum_by_user_this_month")
})

bot.command("year", async (ctx) => {
  return handleReport(ctx, "sum_by_user_by_month")
})

bot.command("store_month", async (ctx) => {
  const { data, error } = await supabase
    .from("sum_by_store_name_this_month")
    .select()

  if (error) {
    throw new Error(error.toString())
  }

  if (!data) {
    throw new Error("No data")
  }

  const responseText = data.reduce((acc: string, obj: any) => {
    acc += `*${obj.store_name}*: ${formatNumber(obj.sum)} ₽\n`
    return acc
  }, "В этом месяце мы потратили:\n\n")

  return ctx.replyWithMarkdown(responseText)
})

bot.on("text", async (ctx) => {
  const fromId = ctx.from.id

  const RECORD_REGEX = /^([A-Za-zА-Яа-я0-9\s]+)\s(\d+)$/
  if (RECORD_REGEX.test(ctx.message?.text)) {
    const [_, store, sum] = ctx.message.text.match(RECORD_REGEX)!

    const storeFullName = STORE_ABBR[store.toLowerCase()] || store

    const { error } = await supabase
      .from("expenses")
      .insert([{ store_name: storeFullName, sum, from_tg_id: fromId }])

    if (error) {
      throw new Error(error.toString())
    }

    const predicate = ["Записал", "Сохранил", "Добавил", "Ок"][
      Math.floor(Math.random() * 3)
    ]

    ctx.reply(`${predicate}: ${storeFullName}, ${formatNumber(sum)} ₽`)
  } else {
    ctx.reply(HELP_MESSAGE)
  }
})

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT")
  process.exit(0)
})
process.once("SIGTERM", () => {
  bot.stop("SIGTERM")
  process.exit(0)
})

export {}

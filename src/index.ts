import express from "express"
import { createClient } from "@supabase/supabase-js"
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TELEGRAM_BOT_TOKEN,
  ALLOWED_TG_ID,
} from "./util/secrets"
import { Telegraf } from "telegraf"

const port = process.env.PORT || 3000
const expressApp = express()

expressApp.get("/", (req, res) => {
  res.send("Hello World!")
})

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const bot = new Telegraf(TELEGRAM_BOT_TOKEN)
bot.launch().catch((err) => {
  console.error(err)
  throw new Error("Launch failed")
})

const HELP_MESSAGE =
  "Мне можно писать в таком формате: магаз сумма. Оба слова через пробел, сумма просто цифрой"

const STORE_ABBR: Record<string, string> = {
  вкусвилл: "ВкусВилл",
  вв: "ВкусВилл",
  азбука: "Азбука Вкуса",
  перек: "Перекресток",
  макдак: "McDonalds",
}

const TG_ID_USERNAME: Record<string, string> = {
  136068023: "Аня потратила",
  185625876: "Сережа потратил",
}

const MONTH_NAME_RUS: string[] = [
  "январе",
  "феврале",
  "марте",
  "апреле",
  "мае",
  "июне",
  "июле",
  "августе",
  "сентябре",
  "октябре",
  "ноябре",
  "декабре",
]

bot.start((ctx) => {
  ctx.reply("Ну здравствуйте!")
})
bot.help((ctx) => ctx.reply(HELP_MESSAGE))

bot.hears("статистика", async (ctx) => {
  const fromId = ctx.from.id

  if (!ALLOWED_TG_ID.includes(fromId)) {
    ctx.reply(`401 Unauthorized`)
    return
  }

  const { data, error } = await supabase.from("sum_by_user_by_month").select()

  if (error) {
    console.error(error)
    ctx.reply(`Упс. Ошибка`)
    return
  }

  const byMonth = data?.reduce((acc, obj) => {
    acc[obj.mon] ? acc[obj.mon].push(obj) : (acc[obj.mon] = [obj])
    return acc
  }, {})

  const responseText = Object.keys(byMonth).reduce((acc: string, k: string) => {
    for (const monthData of byMonth[k]) {
      acc += `В ${MONTH_NAME_RUS[monthData.mon - 1]} ${
        TG_ID_USERNAME[monthData.from_tg_id]
      } ${monthData.Sum}₽\n`
    }
    return acc
  }, "")

  ctx.reply(responseText)
})
bot.hears("статистика по магазинам", (ctx) => {})

bot.on("text", async (ctx) => {
  const fromId = ctx.from.id

  if (!ALLOWED_TG_ID.includes(fromId)) {
    ctx.reply(`401 Unauthorized`)
    return
  }

  const RECORD_REGEX = /^([A-Za-zА-Яа-я0-9\s]+)\s(\d+)$/
  if (RECORD_REGEX.test(ctx.message?.text)) {
    const [_, store, sum] = ctx.message.text.match(RECORD_REGEX)!

    const storeFullName = STORE_ABBR[store.toLowerCase()] || store

    const { error } = await supabase
      .from("expenses")
      .insert([{ store_name: storeFullName, sum, from_tg_id: fromId }])

    if (error) {
      console.error(error)
      ctx.reply(`Упс. Ошибка`)
      return
    }

    const predicate = ["Записал", "Сохранил", "Добавил", "Ок"][
      Math.floor(Math.random() * 3)
    ]

    ctx.reply(`${predicate}: ${storeFullName}, ${sum}₽`)
  } else {
    ctx.reply(HELP_MESSAGE)
  }
})

const server = expressApp.listen(port, async () => {
  console.log(`Bot is up`)
})

// Enable graceful stop
process.once("SIGINT", () => {
  server.close()
  bot.stop("SIGINT")
})
process.once("SIGTERM", () => {
  server.close()
  bot.stop("SIGTERM")
})

export {}

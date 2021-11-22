import { createClient } from "@supabase/supabase-js"
import { Telegraf, Context } from "telegraf"
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TELEGRAM_BOT_TOKEN,
  ALLOWED_TG_ID,
  BOT_URL,
} from "./lib/secrets"
import { formatNumber, capitalize } from "./lib"
import { doughnutChart, barChart } from "./lib/quickchart"
import { calc } from "./lib/calc"
import {
  HELP_MESSAGE,
  STORE_ABBR_DICT,
  TG_ID_USERNAME,
  TG_ID_COLOR,
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

function authMiddleware(ctx: Context, next: () => Promise<any>) {
  const fromId = ctx.from?.id

  if (!fromId || !ALLOWED_TG_ID.includes(fromId)) {
    return ctx.reply(`${fromId} unauthorized`)
  } else {
    return next()
  }
}

bot.use(authMiddleware)

bot.catch((err, ctx) => {
  console.error(err)
  ctx.reply(`Упс. Ошибка`)
})

bot.help((ctx) => ctx.reply(HELP_MESSAGE))

bot.command("abbr", (ctx) => {
  ctx.replyWithMarkdown(
    Object.keys(STORE_ABBR_DICT).reduce((acc, k) => {
      return acc + `${k}: ${STORE_ABBR_DICT[k]}\n`
    }, "**Список аббревиатур**:\n\n")
  )
})

bot.command("month", async (ctx) => {
  const { data, error } = await supabase.from("sum_by_user_this_month").select()

  if (error) {
    throw new Error(error.toString())
  }

  if (!data) {
    throw new Error("No data")
  }

  const sum = data.reduce((acc, { Sum }) => acc + Sum, 0)

  return ctx.replyWithPhoto(
    doughnutChart({
      title: `За ${MONTH_NAME_RUS[data[0].mon - 1]} мы потратили ${formatNumber(
        sum
      )} руб.`,
      data: data.map(({ Sum }) => Sum),
      labels: data.map(({ from_tg_id }) => TG_ID_USERNAME[from_tg_id]),
      colors: data.map(({ from_tg_id }) => TG_ID_COLOR[from_tg_id]),
    })
  )
})

bot.command("year", async (ctx) => {
  const { data, error } = await supabase.from("sum_by_user_by_month").select()

  if (error) {
    throw new Error(error.toString())
  }

  if (!data) {
    throw new Error("No data")
  }

  const byId = data.reduce((acc, obj) => {
    acc[obj.from_tg_id]
      ? acc[obj.from_tg_id].push(obj)
      : (acc[obj.from_tg_id] = [obj])
    return acc
  }, {})

  const sum = data.reduce((acc, { Sum }) => acc + Sum, 0)

  return ctx.replyWithPhoto(
    barChart({
      title: `В этом году мы потратили ${formatNumber(sum)} руб.`,
      datasets: Object.keys(byId).map((id) => {
        return {
          label: TG_ID_USERNAME[id],
          data: byId[id].map(({ Sum }: { Sum: number }) => Sum),
          backgroundColor: TG_ID_COLOR[id],
        }
      }),
      labels: [
        ...new Set(data.map(({ mon }) => capitalize(MONTH_NAME_RUS[mon - 1]))),
      ],
    })
  )
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

  const sum = data.reduce((acc, { sum }) => acc + sum, 0)

  const responseText = data.reduce((acc: string, obj: any) => {
    acc += `*${obj.store_name}*: ${formatNumber(obj.sum)} ₽\n`
    return acc
  }, `В этом месяце мы потратили ${formatNumber(sum)} ₽:\n\n`)

  return ctx.replyWithMarkdown(responseText)
})

bot.on("text", async (ctx) => {
  const fromId = ctx.from.id

  const RECORD_REGEX = /^([a-zA-Zа-яА-Я\s]+)\s([\d\(].*)$/
  if (RECORD_REGEX.test(ctx.message?.text)) {
    const [_, store, mathExpression] = ctx.message.text.match(RECORD_REGEX)!

    const storeFullName = capitalize(
      STORE_ABBR_DICT[store.toLowerCase()] || store
    )

    const sum = calc(mathExpression)

    if (sum === undefined) {
      throw new Error("failed to evaluate math expression")
    }

    const { error } = await supabase
      .from("expenses")
      .insert([{ store_name: storeFullName, sum, from_tg_id: fromId }])

    if (error) {
      throw new Error(error.toString())
    }

    const predicate = [
      "Записал",
      "👌",
      "🤑",
      "Сохранил",
      "Добавил",
      "Ок",
      "✅",
    ][Math.floor(Math.random() * 6)]

    ctx.reply(`${predicate}: ${storeFullName}, ${formatNumber(sum)} ₽`)
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

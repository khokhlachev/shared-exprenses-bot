# Shared Expenses Telegram Bot

## What's inside

- [TypeScript](https://www.typescriptlang.org/) as a main language
- [Telegraf](https://github.com/telegraf/telegraf) as a bot framework of choice, because it's the most popular TypeScript bot framework
- [Supabase](https://supabase.io/) as SaaS backend, because it's fast and free, and it's Postgres underneath
- [Quickchart](https://quickchart.io) as a SaaS Chart.js provider, because it renders to the picture and is free

## Usage

```bash
$ yarn
$ yarn build
$ yarn start
```

The bot uses `polling` when running locally and `webhooks` in `production`.

`Webhooks` mode allows run on [Heroku](https://www.heroku.com/) free tier, because a `POST` request can wake up a free `dyno`, and `polling` allows to easily run on local.

## Available commands

1. `/month` replies with a doughnut chart of current month expenses groupped by user
2. `/year` gives a table of expenses over the year by months
3. `/store_month` sends a list of expenses by stores in this month
4. `/abbr` replies with a list of available shortcuts

## License [MIT](LICENSE)

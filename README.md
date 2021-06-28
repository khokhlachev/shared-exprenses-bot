# Shared Expenses Telegram Bot

## What's inside

- [TypeScript](https://www.typescriptlang.org/) as a main language
- [Telegraf](https://github.com/telegraf/telegraf) as a bot framework of choice, because it's the most popular TypeScript bot framework
- [Supabase](https://supabase.io/) as SaaS backend, because it's free and easy, and it's Postgres underneath

## Usage

```bash
$ yarn
$ yarn build
$ yarn start
```

The bot uses `polling` when running locally and `webhooks` in `production`.

`Webhooks` mode allows run on [Heroku](https://www.heroku.com/) free tier, because a `POST` request can wake up a free `dyno`, and `polling` allows to easily run on local.

## License [MIT](LICENSE)

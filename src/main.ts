import express from 'express'
import * as onair from './routes/onair.js'
import * as response from './utils/response.js'
import { WebError } from './utils/web-error.js'
import * as data from './utils/data.js'

export async function main(): Promise<void> {
  data.start()

  const app = express()
  response.use(app)
  app.use(express.json())
  app.route('/onair').post(onair.post).get(onair.get).delete(onair.del)
  app.use(() => {
    throw new WebError('Not found', { status: 404 })
  })
  app.use(((err, _req, res, next) => {
    if (res.headersSent) {
      return next(err)
    }
    res.error(err)
  }) as express.ErrorRequestHandler)

  const port = 3000
  app.listen(port, (err) => {
    if (err) {
      throw err
    }
    console.log(`onair listening on port ${port}`)
  })
}

main().catch((e) => {
  console.error(e.stack)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, gracefully exiting the process.')
  process.exit(128 + 2 /* SIGINT */)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, gracefully exiting the process.')
  process.exit(128 + 15 /* SIGTERM */)
})

process.on('exit', (code) => {
  console.log(`Exiting with code '${code}'`)
})

process.on('unhandledRejection', (reason, p) => {
  console.log('Potential unhandled rejection', p, reason)
  process.exit(1)
})

process.on('uncaughtException', (e) => {
  console.log('Uncaught exception', e)
  process.exit(1)
})

process.on('warning', (e) => {
  console.log('warning', e)
})

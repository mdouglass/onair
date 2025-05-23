import express from 'express'

declare global {
  namespace Express {
    interface Response {
      ok: typeof okResponse
      error: typeof errorResponse
    }
  }
}

export function use(app: express.Express): void {
  app.response.ok = okResponse
  app.response.error = errorResponse
}

function okResponse(this: express.Response, data: unknown): express.Response {
  return this.json({ ok: true, value: data })
}

function errorResponse(this: express.Response, e: unknown): express.Response {
  let message: string
  let status: number
  if (e instanceof Error) {
    message = e.message
    status = (e as { status?: number }).status ?? (e as { statusCode?: number }).statusCode ?? 500
  } else {
    message = String(e)
    status = 500
  }
  return this.status(status).json({ ok: false, error: { message } })
}

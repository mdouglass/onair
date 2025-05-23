import { z } from 'zod/v4'
import express from 'express'
import { WebError } from '../utils/web-error.js'
import { deleteAll, getDeviceState, setDeviceState } from '../utils/data.js'

const OnAirRequestSchema = z.object({
  machine: z.string(),
  device: z.enum(['camera', 'microphone']),
  state: z.boolean(),
})

function parseRequestBody(data: string) {
  const result = OnAirRequestSchema.safeParse(data)
  if (result.success) {
    return result.data
  }
  throw new WebError(z.prettifyError(result.error), { status: 400 })
}

export async function post(req: express.Request, res: express.Response): Promise<void> {
  const body = parseRequestBody(await req.body)
  const result = await setDeviceState(body.machine, body.device, body.state)
  res.ok(result)
}

export async function del(_req: express.Request, res: express.Response): Promise<void> {
  await deleteAll()
  res.ok({ state: false, updatedAt: 0 })
}

export async function get(_req: express.Request, res: express.Response): Promise<void> {
  const result = await getDeviceState()
  res.ok(result)
}

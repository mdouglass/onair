import assert from 'node:assert/strict'
import { z } from 'zod/v4'
import express from 'express'
import { WebError } from '../utils/web-error.js'
import { deleteAll, getDeviceState, setDeviceState } from '../utils/data.js'
import { setSwitch } from '../utils/home-assistant.js'

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

  try {
    assert.ok(process.env.SWITCH_ENTITY, 'SWITCH_ENTITY is not set')
    await setSwitch(process.env.SWITCH_ENTITY, result.state)
  } catch (e) {
    console.error('Error setting switch', (e as Error).message)
  }
}

export async function del(_req: express.Request, res: express.Response): Promise<void> {
  await deleteAll()
  res.ok({ state: false, updatedAt: 0 })
}

export async function get(_req: express.Request, res: express.Response): Promise<void> {
  const result = await getDeviceState()
  res.ok(result)
}

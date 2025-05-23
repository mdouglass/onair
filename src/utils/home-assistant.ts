import assert from 'node:assert/strict'

export async function setSwitch(switchEntity: string, isOn: boolean): Promise<void> {
  assert.ok(process.env.HA_URL, 'HA_URL is not set')
  assert.ok(process.env.HA_TOKEN, 'HA_TOKEN is not set')
  const url = `${process.env.HA_URL}/api/services/switch/${isOn ? 'turn_on' : 'turn_off'}`
  console.log({ url })
  const body = JSON.stringify({ entity_id: switchEntity })
  console.log({ body })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body,
  })
  const resBody = await res.text()
  console.log({ resBody })
}

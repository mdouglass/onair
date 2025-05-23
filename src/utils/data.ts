import assert from 'node:assert/strict'
import sqlite from 'node:sqlite'

let database: sqlite.DatabaseSync | undefined

export function start(): void {
  const dbPath = process.env.DB_PATH ?? ':memory:'
  console.log('Using sqlite database from', dbPath)
  database = new sqlite.DatabaseSync(dbPath)
  database.exec(`
    CREATE TABLE IF NOT EXISTS DeviceState (
      machine TEXT(64) NOT NULL,
      device TEXT(16) NOT NULL,
      state INTEGER NOT NULL,
      CONSTRAINT DeviceState_PK PRIMARY KEY (machine, device)
    )
  `)
  const row = database
    .prepare(`SELECT 1 as value FROM pragma_table_info('DeviceState') WHERE name = 'updatedAt'`)
    .all()
  if (row.length !== 1) {
    database.exec(`ALTER TABLE DeviceState ADD COLUMN updatedAt INTEGER DEFAULT 0`)
    database.prepare(`UPDATE DeviceState SET updatedAt = :now`).run({ now: Date.now() })
  }
}

export async function getAll(): Promise<
  { machine: string; device: string; state: boolean; updatedAt: number }[]
> {
  assert.ok(database, 'Database not initialized')
  const rows = database.prepare('SEELCT * FROM DeviceState').all()
  return rows.map((row) => ({
    machine: String(row.machine),
    device: String(row.device),
    state: Boolean(row.state),
    updatedAt: Number(row.updatedAt),
  }))
}

export async function getDeviceState(): Promise<{ state: boolean; updatedAt: number }> {
  assert.ok(database, 'Database not initialized')
  const row = database
    .prepare(
      'SELECT COALESCE(SUM(state),0) AS count, COALESCE(MAX(updatedAt),0) AS updatedAt FROM DeviceState;',
    )
    .get()
  assert.ok(row, 'Row not found')
  return { state: Boolean(row.count), updatedAt: Number(row.updatedAt) }
}

export async function setDeviceState(
  machine: string,
  device: 'camera' | 'microphone',
  state: boolean,
): Promise<{ state: boolean; updatedAt: number }> {
  assert.ok(database, 'Database not initialized')
  database
    .prepare(
      `
      INSERT INTO DeviceState (machine, device, state, updatedAt)
      VALUES (:machine, :device, :state, :updatedAt)
      ON CONFLICT (machine, device) DO UPDATE SET state = :state, updatedAt = :updatedAt
      `,
    )
    .run({ machine, device, state: state ? 1 : 0, updatedAt: Date.now() })
  return getDeviceState()
}

export async function deleteAll(): Promise<void> {
  assert.ok(database, 'Database not initialized')
  database.exec('DELETE FROM DeviceState')
}

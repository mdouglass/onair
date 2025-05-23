# On Air

The On Air service receives reports from multiple devices about the state of their cameras/microphones. If any of those devices have a camera/microphone that is in the on state, then On Air will talk to Home Assistant and turn on the On Air light.

Separate scripts run on various machines to report the state of their respective cameras.

## API

All API endpoints return JSON data and use the same high-level structure for their responses:
```json
{ "ok": true, "value": ... }
{ "ok": false, "error": { "message": "...", ... } }
```

### GET /onair

Returns the current state of the system

```json
{ "ok": true, "value": { "state": boolean, "updatedAt": number } }
```

- `state`: `true` if any machine currently has a camera or a microphone in the on state
- `updatedAt`: UTC timestamp in ms since the epoch of the time POST/DELETE was last invoked

### POST /onair

Update the state of a microphone or camera for a machine

```json
{ "machine": string, "device": "camera|microphone", "state": boolean }
```

Response format is the same as `GET /onair`

### DELETE /onair

This deletes _all_ device state, effectively setting all machines to having their devices off.

Response format is the same as `GET /onair`

## Build

A GitHub actions build script generates the mdouglass/onair image.

## Deployment

The onair service (this repository) runs on statler (Synology NAS). Deployments are handled manually through the Synology control panel.

### Environment Variables
- `DB_PATH`: Path to the SQLite database file. If you don't care about persistent state you can set this to `:memory:` to use an in-memory database that will be lost (effectively performing a `DELETE /onair` on restart). Otherwise, this should be set to the path of a file in a Docker volume mount
- `HA_URL`: http(s) URL for your Home Assistant
- `HA_TOKEN`: Home Assistant token
- `SWITCH_ENTITY`: The switch to toggle when device state changes
 
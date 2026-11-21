# Error Deva

The Error Deva

The Error Deva is a specialized module in the Indra.ai ecosystem designed to handle, capture, and report errors across Deva Core and its connected agents. It provides a consistent and structured way to log, trace, and escalate issues while preserving full chain-of-custody with cryptographic validation. This ensures that every error event is not only recorded for debugging but also backed by verifiable hashes, making the records secure, auditable, and reliable.

By installing with npm install @indra.ai/deva.error --save, developers gain access to a ready-to-use error management system that integrates seamlessly into the Deva Core framework. The Error Deva transforms errors into actionable intelligence, routing them into logs, reports, and monitoring channels while maintaining compliance with the layered Vedic License Agreement (VLA). It’s more than just error handling—it’s a safeguard for lawful operation and trustworthy system oversight.

install: `npm i @indra.ai/deva.error --save`

usage: 
```js
import error from '@indra.ai/deva.error';
-or-
const error = require('@indra.ai/deva.error');
```

## Requirements

- Node.js with npm. Error Deva's `package.json` sets no `engines`. Deva Core 1.67.8 declares `"node": ">=22"` and `"npm": ">=9.5.1"` in its own `package.json`.
- A project with `"type": "module"` in its `package.json`. Error Deva is an ES module.
- `@indra.ai/deva` `^1.67.8` (Deva Core) and `mongodb` `^6.14.2`. Both install with Error Deva.
- A MongoDB server if you want errors saved. A local `mongod` at `mongodb://127.0.0.1:27017` is enough.

## Two licenses

A running Deva carries two separate licenses, and each is checked on its own.

- **The core license** comes through the client data as `client.VLA`. Deva Core checks it against the core package's VLA at the start of `init`.
- **The agent license** comes through the license feature data as `features.license.devas.error`. Deva Core 1.67.8 checks it against the VLA in Error Deva's own `package.json` right after the features load and before `onInit`. Error Deva has no `onInit` of its own, so it has no license check of its own to change or remove.

The agent check compares the sha256 of the whole VLA object, so every field has to match exactly.

## Configuration

Error Deva reads two features from the client you pass to `init()`. The feature data loader puts them in the client, and Deva Core loads them into the Deva at startup, so both must be there before `init()` runs.

```json
"features": {
	"license": {
		"concerns": [],
		"global": [],
		"devas": {
			"error": {"uid": "59024890266819710612"}
		}
	},
	"error": {
		"concerns": [],
		"global": {
			"mongo": {
				"uri": "mongodb://127.0.0.1:27017",
				"database": "ErrorDeva"
			}
		},
		"devas": {}
	}
}
```

- `license.devas.error` is the agent VLA. The short form above only shows where it goes. It must be the full `VLA` object from this package's `package.json`, for example:

```js
import pkg from '@indra.ai/deva.error/package.json' with {type:'json'};

const devas = {error: pkg.VLA}; // goes in features.license.devas
```

- `error.global.mongo.uri` is the MongoDB connection string. If it is not set, Error Deva still comes online but builds no MongoDB client, and nothing is saved.
- `error.global.mongo.database` is the database Error Deva writes to. Errors go to its `errors` collection.

## Load it

```js
import ErrorDeva from '@indra.ai/deva.error';

const data = await ErrorDeva.init(client); // client data provided by your loader
console.log(data.id.uid);
```

When the license checks pass, Error Deva walks start, enter, done and ready. In `onReady` it reads `this.error().global?.mongo`, builds a `MongoClient` in `this.modules.client` when `uri` is set, keeps `database` in `this.vars.database`, and prompts `‼️ Error Deva Ready > VLA:59024890266819710612`.

To shut it down:

```js
await ErrorDeva.stop();
```

`onStop` closes the MongoDB client, if there is one, before Deva Core finishes the stop chain.

## When Error Deva refuses to start

If the agent license check fails, Deva Core prompts the message, stops the Deva, and `init()` resolves with that message.

| You see | Why |
| --- | --- |
| `❌ Bad Personal VLA` | `features.license.devas` is there but has no `error` entry. |
| `❌ Invalid VLA Check` | The `error` entry doesn't match this package's VLA, or the license feature has no `devas`. |

A stopped Deva can start again. Call `init()` again with a client whose license data passes the check. Error Deva registers its listener again and builds a new MongoDB client in `onReady`.

## What it writes

Whenever a Deva calls `this.err(err, packet, reject)`, Deva Core builds an error record with the error's name, message and stack, the agent, the client, the packet that failed and the md5, sha256 and sha512 hashes, and talks it on `devacore:error`. Error Deva's `devacore:error` listener hands that record to `error_write('errors', packet)`, which saves it to the `errors` collection.

If there is no MongoDB client, `error_write` returns `false` without writing. If the insert fails, it logs the failure with `console.error` and returns `false`, so a failure in the error writer never starts a new error loop.

When Error Deva itself errors, its `onError` prompts `‼️ Error Alert`, logs the error to the console, and rejects with the original error.

## Inside Error Deva

| Name | Kind | What it does |
| --- | --- | --- |
| `devacore:error` | listener | Calls `this.func.error_write('errors', packet)` for each error record. |
| `error_write(type, packet)` | func | Inserts `packet` into the `type` collection of `this.vars.database`. Returns the insert result, or `false` with no client or on failure. |
| `translate`, `parse`, `process` | utils | Each returns its input trimmed. |
| `onReady` | lifecycle | Builds the MongoDB client from the error feature data and prompts the ready message. |
| `onStop` | lifecycle | Closes the MongoDB client, then calls `this.close(data, resolve)`. |
| `onError` | lifecycle | Prompts the error message, logs the error, and returns `reject(err)` or `Promise.reject(err)`. |
| `modules.client` | module | The `MongoClient`, set in `onReady` when a `uri` is given. |

`methods` and `devas` are empty.

The `vars` in `package.json` hold:

- `messages`: the prompt text for `init`, `start`, `enter`, `ready`, `stop`, `exit`, `done` and `error`.
- `live` and `ask`: settings carried in the agent data.
- `context`: empty.

`this.vars.database` is set in `onReady` from the error feature data.

## Testing

Start a local MongoDB, then run:

```bash
npm test
```

`npm test` runs `node --test`. The tests use `mongodb://127.0.0.1:27017` by default. To use another server, set `MONGO_URI`:

```bash
MONGO_URI="mongodb://127.0.0.1:27018" npm test
```

The tests always write to their own database, `deva_error_test`, and drop it when they finish. Only the server can change, so the cleanup never touches another database. If MongoDB can't be reached, the two MongoDB tests are skipped with a message and the rest still run.

The tests build a stub client in code from the core VLA in `@indra.ai/deva/package.json` and the VLA in this package's `package.json`, so no client file is needed. They cover:

- error builds as a Deva and waits offline before init
- error data has no placeholders left
- error comes online and walks to ready
- error agent matches the package
- error utils answer with trimmed text
- error_write saves a packet to the test database (MongoDB)
- a devacore:error event is written to the errors collection (MongoDB)
- error stops through the full chain
- error refuses to start with a bad agent VLA

## Files

| File | What it holds |
| --- | --- |
| `index.js` | The Error Deva. |
| `package.json` | Package info, the package VLA, and the agent and vars data under `data`. |
| `feature/methods.js` | An `error(packet)` feature method that signs the packet with `this.methods.sign('error', 'default', packet)`. |
| `help/main.feecting` | The main help page and the license block. |
| `help/corpus.feecting` | The help corpus. |
| `index.test.js` | The tests. |
| `assets/` | The emoji, avatar, image and background images. |
| `LICENSE.md` | The license. |

Copyright ©2000-2026 Quinn Michaels; All rights reserved.  
Owner Signature Required For Lawful Use.  
Distributed under VLA:59024890266819710612 LICENSE.md  
Thursday, November 19, 2026 - 5:57:23 PM PST

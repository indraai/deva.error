# Error Deva: proposed changes (Nov 20 2026)

Based on deva.error f6fbc3c (0.25.2), pulled Friday, Nov 20 2026, 8:31 AM PT. Core 1.65.30. Line numbers are from that commit. All changes were tested together in `/tmp/dt/err/fixed` against a local mongod 8.0.4. The full file is `index.js.proposed`, and the diff is `index.js.proposed.diff`.

## index.js

1. In `onInit`, replace line 77, `return license_check ? this.start(data, resolve) : this.stop(data, resolve);`, with:

```
	if (license_check?.id) return this.start(data, resolve); // start if license valid
	this.prompt(license_check); // prompt invalid license check.
	return this.stop().then(() => resolve(license_check)); // stop then resolve license_check.
```

2. In `onReady`, replace line 80, `const {uri,database} = this.error().global.mongo;`, with:

```
	const {uri,database} = this.error().global?.mongo || {}; // mongo config from the error feature
```

3. In `onReady`, replace line 82, `this.modules.client = new MongoClient(uri);`, with:

```
	if (uri) this.modules.client = new MongoClient(uri); // only build the client when a uri is set
```

4. In `func.error_write`, add this line after line 59, `let result = false;`:

```
	if (!this.modules.client) return result; // no database configured
```

5. Add an `onStop` hook between `onReady` and `onError`:

```
	onStop(data, resolve) {
		const {client} = this.modules;
		if (!client) return this.close(data, resolve);
		return client.close().then(() => this.close(data, resolve)); // close the database before shutdown
	},
```

6. In `onError`, replace line 90, `return reject(err);`, with:

```
	return reject ? reject(err) : Promise.reject(err);
```

## Files to replace

7. Replace `index.test.js` with the one in this folder. The committed test puts the agent VLA at `features.license.devas.license`. Error Deva reads `features.license.devas.error`, and the Mongo settings at `features.error.global.mongo`, which the committed stub doesn't have.
8. Replace `README.md` with the one in this folder.

## Optional, your call

9. In `help/main.feecting` line 8, change `# {{profil.ename}}` to `# {{profile.name}}`. The same typo is in deva.log, deva.support and deva.systems.
10. In `package.json` `data.vars.context`, change `"finish": "Finshed"` to `"finish": "Finished"`.
11. The headers of `index.js`, `index.test.js`, `feature/methods.js` and both help files still say `Quinn Arjuna Michaels`. `package.json` and `README.md` now say `Quinn Michaels`.
12. `error_write` runs `this.prompt('error_write')` and `console.log(packet)` on every error (lines 56 and 57). The second prints the whole packet, including the agent and client, to stdout. Delete both lines if that output isn't wanted.
13. The comment above `error_write` (lines 49 to 54) still says `func: log_write` and "json log file". Make it read:

```
	/**************
	func: error_write
	params: type, packet
	describe: writes the error packet to the type collection in the error database.
	***************/
```

14. `feature/methods.js` calls `this.methods.sign('error', 'default', packet)`. Core has no `methods.sign`. Its `sign(packet)` is a Deva function that takes one packet with `q.meta`. Nothing in the tests calls this method, so it's left alone here. License Deva's version is a stub that returns `'Not Working'`.

## No change needed

- `package.json` already has `"test": "node --test"`, and it declares `mongodb ^6.14.2`, so the tests need no new dependency.

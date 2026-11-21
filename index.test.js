"use strict";
// Error Deva Test File
// Copyright ©2000-2026 Quinn Michaels; All rights reserved.  
// Owner Signature Required For Lawful Use.  
// Distributed under VLA:59024890266819710612 LICENSE.md
// Thursday, November 19, 2026 - 5:57:23 PM PST

// run with: npm test
// MongoDB tests use a local server at mongodb://127.0.0.1:27017 by default. Set MONGO_URI to use another one.
// They skip with a message when MongoDB can't be reached.
import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {MongoClient} from 'mongodb';
import Deva from '@indra.ai/deva';
import core from '@indra.ai/deva/package.json' with {type:'json'};
import pkg from './package.json' with {type:'json'};
import ERROR from './index.js';

const STAGES = ['start', 'enter', 'done', 'ready'];
const TIERS = ['md5', 'sha256', 'sha512'];
const PLACEHOLDER = /::[a-z-]+::|\{\{profile\.[a-z]+\}\}/;

// test database: the uri can change, the database name is fixed so the after hook only ever drops the test database.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const MONGO_DB = 'deva_error_test';
const COLLECTION = 'errors'; // the collection the devacore:error listener writes to.
const TEST_ID = `error-test-${Date.now()}`;

// check the server once before the tests are defined so the MongoDB tests can skip cleanly.
const mongo = new MongoClient(MONGO_URI, {serverSelectionTimeoutMS: 2000});
const MONGO_SKIP = await mongo.db('admin').command({ping: 1}).then(
	() => false,
	err => `MongoDB is not reachable at ${MONGO_URI} (${err.message}). Start a local mongod or set MONGO_URI.`
);
if (MONGO_SKIP) console.log(`⏭️ ${MONGO_SKIP}`);

// stub client built in code: the core VLA for the core check, the agent VLA for Error Deva
// and the mongo settings for the error feature.
const client = (agentVLA = pkg.VLA) => ({
	id: '00000000000000000000',
	key: 'client',
	VLA: structuredClone(core.VLA),
	prompt: {
		emoji: '🧪',
		text: 'client',
		colors: {
			label: {R: 2, G: 229, B: 77},
			text: {R: 2, G: 229, B: 77},
		},
	},
	profile: {
		id: '00000000000000000000',
		name: 'Test Client',
		describe: 'Test client for Error Deva',
		lang: 'en',
		locale: 'en-US',
		currency: 'USD',
	},
	features: {
		license: {
			concerns: [],
			global: [],
			devas: {
				error: structuredClone(agentVLA),
			},
		},
		error: {
			concerns: [],
			global: {
				mongo: {uri: MONGO_URI, database: MONGO_DB},
			},
			devas: {},
		},
	},
});

// wait for the listener to write a document, since the devacore:error listener doesn't wait on the insert.
async function findDoc(query, tries = 30) {
	for (let i = 0; i < tries; i++) {
		const doc = await mongo.db(MONGO_DB).collection(COLLECTION).findOne(query);
		if (doc) return doc;
		await new Promise(r => setTimeout(r, 100));
	}
	return null;
}

let errorClient = false; // Error Deva's own MongoClient, kept so the after hook can close it.

after(async () => {
	if (!MONGO_SKIP) await mongo.db(MONGO_DB).dropDatabase();
	await mongo.close();
	if (errorClient) await errorClient.close();
});

test('error builds as a Deva and waits offline before init', async () => {
	assert.ok(ERROR instanceof Deva, 'the export is a Deva');
	assert.equal(await ERROR.stop(), ERROR._messages.offline, 'stop before init answers offline');
});

test('error data has no placeholders left', () => {
	assert.doesNotMatch(JSON.stringify(pkg.data), PLACEHOLDER, 'package.json data');
	assert.doesNotMatch(JSON.stringify(pkg.VLA), PLACEHOLDER, 'package.json VLA');
	assert.doesNotMatch(pkg.copyright, PLACEHOLDER, 'package.json copyright');
});

test('error comes online and walks to ready', async () => {
	const prompts = [];
	ERROR.listen('devacore:prompt', packet => prompts.push(packet.text));
	const data = await ERROR.init(client());
	for (const k of STAGES) assert.equal(typeof data[k], 'number', `${k} timestamp`);
	assert.ok(data.start <= data.enter && data.enter <= data.done && data.done <= data.ready, 'stages in order');
	assert.equal(typeof data.id.uid, 'string', 'uid');
	for (const t of TIERS) assert.equal(typeof data[t], 'string', `${t} hash`);
	assert.ok(prompts.includes(`${ERROR.vars.messages.ready} > VLA:${pkg.VLA.uid}`), 'onReady prompts the ready message');
	assert.ok(ERROR.modules.client instanceof MongoClient, 'onReady builds the MongoClient');
	assert.equal(ERROR.vars.database, MONGO_DB, 'onReady sets the database');
	errorClient = ERROR.modules.client;
});

test('error agent matches the package', () => {
	const agent = ERROR.agent();
	assert.equal(agent.key, 'error');
	assert.equal(agent.profile.name, 'Error Deva');
	assert.equal(agent.profile.owner, 'Quinn Michaels');
});

test('error utils answer with trimmed text', () => {
	const {translate, parse, process} = ERROR.utils;
	for (const util of [translate, parse, process]) assert.equal(util('  hello  '), 'hello');
});

test('error_write saves a packet to the test database', {skip: MONGO_SKIP}, async () => {
	const result = await ERROR.func.error_write(COLLECTION, {test: TEST_ID, kind: 'direct'});
	assert.equal(result.acknowledged, true, 'insert acknowledged');
	const doc = await findDoc({_id: result.insertedId});
	assert.equal(doc?.test, TEST_ID, 'the packet reads back');
	assert.equal(doc.kind, 'direct');
});

test('a devacore:error event is written to the errors collection', {skip: MONGO_SKIP}, async () => {
	const message = `error deva test ${TEST_ID}`;
	await assert.rejects(
		new Promise((resolve, reject) => ERROR.err(new Error(message), {test: TEST_ID, kind: 'event'}, reject)),
		{message},
		'err rejects with the original error'
	);
	const doc = await findDoc({'packet.test': TEST_ID, 'packet.kind': 'event'});
	assert.ok(doc, 'the error document was written');
	assert.equal(doc.key, 'error');
	assert.equal(doc.value, 'error', 'the error came from Error Deva');
	assert.equal(doc.error.name, 'Error');
	assert.equal(doc.error.message, message);
	for (const t of TIERS) assert.equal(typeof doc[t], 'string', `${t} hash on the error document`);
});

test('error stops through the full chain', async () => {
	const data = await ERROR.stop();
	assert.equal(data.key, 'shutdown', 'the chain ends on shutdown');
	assert.equal(data.value, 'error');
});

// stop() is final, so the refusal check loads a fresh Error Deva instance from the same file.
test('error refuses to start with a bad agent VLA', async () => {
	const {default: REFUSE} = await import('./index.js?refuse');
	const prompts = [];
	REFUSE.listen('devacore:prompt', packet => prompts.push(packet.text));
	const result = await REFUSE.init(client({uid: 'bad'}));
	assert.equal(result, REFUSE._messages.checkVLA, 'init answers with the invalid VLA message');
	assert.ok(prompts.includes(REFUSE._messages.checkVLA), 'core prompts the invalid VLA message');
	assert.equal(REFUSE._active, false, 'the Deva stays offline');
	if (REFUSE.modules?.client) await REFUSE.modules.client.close(); // close it if the Deva wrongly reached onReady
});

"use strict";
// Error Deva
// Copyright ©2000-2026 Quinn Arjuna Michaels; All rights reserved. 
// Owner Signature Required For Lawful Use.
// Distributed under VLA:59024890266819710612 LICENSE.md
// Thursday, November 19, 2026 - 5:57:23 PM PST

import Deva from '@indra.ai/deva';
import {MongoClient} from 'mongodb';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

const info = {
  id: pkg.id,
  license: pkg.license,
  VLA: pkg.VLA,
  name: pkg.name,
  describe: pkg.description,
  version: pkg.version,
  dir: __dirname,
  url: pkg.homepage,
  git: pkg.repository.url,
  bugs: pkg.bugs.url,
  author: pkg.author,
  copyright: pkg.copyright,
};

const ErrorDeva = new Deva({
  info,
  agent,
  vars,
  utils: {
    translate(input) {return input.trim();},
    parse(input) {return input.trim();},
    process(input) {return input.trim();}
  },
  listeners: {
    'devacore:error'(packet) {
      this.func.error_write('errors', packet);
    }
  },
  modules: {},
  devas: {},
  func: {
    /**************
    func: error_write
    params: type, packet
    describe: this is the error log writer function that handles writing
    the errors to the proper database.
    ***************/
    async error_write(type, packet) {

      const created = Date.now();
      let result = false;
      if (!this.modules.client) return result; // no database configured
      
      try {
        const database = this.modules.client.db(this.vars.database);
        const collection = database.collection(type);
        result = await collection.insertOne(packet);
      } catch (e) {
        console.error(e);
      } finally {
        return result;
      }
    },
  },
  methods: {},
  onReady(data, resolve) {
    const {uri,database} = this.error().global?.mongo || {};
    const {VLA} = this.info();
    if (uri) this.modules.client = new MongoClient(uri); // build the client if uri is set
    this.vars.database = database;
    this.prompt(`${this.vars.messages.ready} > VLA:${VLA.uid}`);
    return resolve(data);
  },
  onStop(data, resolve) {
    const {client} = this.modules;
    if (!client) return this.close(data, resolve);
    return client.close().then(() => this.close(data, resolve)); // close the database before shutdown
  },
  onError(err, data, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject ? reject(err) : Promise.reject(err);
  },
});
export default ErrorDeva

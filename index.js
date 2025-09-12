// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under the Vedic License Agreement LICENSE.md
// The Error Deva for deva.world

import Deva from '@indra.ai/deva';
import {MongoClient} from 'mongodb';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;

import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

const info = {
  id: pkg.id,
  name: pkg.name,
  describe: pkg.description,
  version: pkg.version,
  dir: __dirname,
  url: pkg.homepage,
  git: pkg.repository.url,
  bugs: pkg.bugs.url,
  author: pkg.author,
  license: pkg.license,
  copyright: pkg.copyright,
};

const ERROR = new Deva({
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
      this.methods.echo(agent.key, 'a', packet);
      this.func.error_write('errors', packet);
    }
  },
  modules: {},
  func: {
    /**************
    func: log_write
    params: type, packet
    describe: this is the log file writer function that handles writing
    the interactions to json log file.
    ***************/
    async error_write(type, packet) {
      this.prompt('error_write')
      console.log(packet);
      const created = Date.now();
      let result = false;
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
    const {uri,database} = this.error().global.mongo;
    this.modules.client = new MongoClient(uri);
    this.vars.database = database;
    this.prompt(this.vars.messages.ready)
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject(err);
  },
});
export default ERROR

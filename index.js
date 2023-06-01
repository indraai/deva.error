// Copyright (c)2022 Quinn Michaels
// The main Error Deva

const fs = require('fs');
const path = require('path');

const package = require('./package.json');
const info = {
  id: package.id,
  name: package.name,
  describe: package.description,
  version: package.version,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  author: package.author,
  license: package.license,
  copyright: package.copyright,
};

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).DATA;

const Deva = require('@indra.ai/deva');
const ERROR = new Deva({
  info,
  agent: {
    id: agent.id,
    key: agent.key,
    prompt: agent.prompt,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      return input.trim();
    }
  },
  vars,
  deva: {},
  listeners: {},
  modules: {},
  func: {
    error(opts) {}
  },
  methods: {
    /**************
    method: uid
    params: packet
    describe: Return system unique id.
    ***************/
    uid(packet) {
      this.context('uid');
      return Promise.resolve(this.uid());
    },

    /**************
    method: status
    params: none
    describe: Return the status of the Error Deva.
    ***************/
    status() {
      this.context('status');
      return Promise.resolve(this.status());
    },

    /**************
    method: help
    params: packet
    describe: Return the Error Deva Help files.
    ***************/
    help(packet) {
      this.context('help');
      return new Promise((resolve, reject) => {
        this.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    },
  },
  onDone(data) {
    this.listen('error', this.func.error);
  }
});
module.exports = ERROR

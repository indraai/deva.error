// Copyright (c)2022 Quinn Michaels
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const ERROR = new Deva({
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
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
  listeners: {
    /**************
    func: error
    params: packet
    describe: global listener that grabs all broadcasted errors and calls the
    report function.
    ***************/
    error(packet) {
      this.func.report(packet);
    }
  },
  modules: {},
  func: {
    /**************
    func: report
    params: packet
    describe: The default system report function that outputs the errors.
    ***************/
    report(packet) {
      return Promise.resolve(this.vars.error);
    },
  },
  methods: {
    /**************
    method: status
    params: none
    describe: Return the status of the Error Deva.
    ***************/
    status() {
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: Return the Error Deva Help files.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
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
});
module.exports = ERROR

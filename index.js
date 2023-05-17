// Copyright (c)2022 Quinn Michaels
// Error Deva

const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const ERROR = new Deva({
  agent: {
    id: agent.id,
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
    log(packet) {
      const theMonth = new Date().getMonth();
      const theYear = new Date().getFullYear();
      const theDir = path.join(__dirname, '..', '..', 'logs', 'errors', packet.a.agent.key, theYear, theMonth);
      const logfile = path.join(theDir, `${this.lib.getToday()}.json`);
      const d = new Date();

      return new Promise((resolve, reject) => {
        fs.mkdir(theDir, {recursive:true}, err => {
          if (err) return reject(err);
          // first check for file and if it does not then write the base file for the day
          if (! fs.existsSync(logfile)) {
            const json = {
              id: this.uid(),
              date: this.lib.formatDate(d),
              copyright: `Copyright (c) ${d.getFullYear()} Quinn Michaels, All Rights Reserved.`,
              data: [],
            };
            const data = JSON.stringify(json);
            fs.writeFileSync(logfile, data, {encoding:'utf8',flag:'w'});
          }

          // then after we check the file we are going to read the file and then add new data to the log.
          const raw = fs.readFileSync(logfile);
          const log = JSON.parse(raw);
          log.data.push(packet);
          fs.writeFileSync(logfile, JSON.stringify(log), {encoding:'utf8',flag:'w'});
          
        })
      });
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

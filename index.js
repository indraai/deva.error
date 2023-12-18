// Copyright (c)2022 Quinn Michaels
// The main Error Deva for deva.world
const Deva = require('@indra.ai/deva');
const package = require('./package.json');
const info = {
  id: package.id,
  name: package.name,
  describe: package.description,
  version: package.version,
  dir: __dirname,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  author: package.author,
  license: package.license,
  copyright: package.copyright,
};
const {agent,vars} = require('./data.json').DATA;
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
    'error'(packet) {
      this.func.error(packet);
    }
  },
  modules: {},
  func: {
    error(err) {
      console.log('ERROR ERROR DEVA', err);
      return;
    }
  },
  methods: {},
});
module.exports = ERROR

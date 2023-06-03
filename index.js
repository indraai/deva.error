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
  agent,
  vars,
  utils: {
    translate(input) {return input.trim();},
    parse(input) {return input.trim();},
    process(input) {return input.trim();}
  },
  listeners: {},
  modules: {},
  func: {
    error(err) {return;}
  },
  methods: {},
  onDone(data) {
    this.listen('error', this.func.error);
  }
});
module.exports = ERROR

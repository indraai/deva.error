// Copyright (c)2022 Quinn Michaels
// The main Error Deva for deva.world
import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};

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

import data from './data.json' with {type:'json'};
const {agent,vars} = data.DATA;
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
export default ERROR

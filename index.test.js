"use strict";
// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:60708001829108561844 LICENSE.md

// ERROR test file

const {expect} = require('chai')
const error = require('./index.js');

describe(error.me.name, () => {
  beforeEach(() => {
    return error.init()
  });
  it('Check the Deva Object', () => {
    expect(error).to.be.an('object');
    expect(error).to.have.property('agent');
    expect(error).to.have.property('vars');
    expect(error).to.have.property('listeners');
    expect(error).to.have.property('methods');
    expect(error).to.have.property('modules');
  });
})

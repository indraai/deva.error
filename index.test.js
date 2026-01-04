"use strict";
// Error Deva Test File
// Copyright ©2000-2026 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:64819928900499225876 LICENSE.md
// Sunday, January 4, 2026 - 9:04:53 AM

const {expect} = require('chai')
const ErrorDeva = require('./index.js');

describe(ErrorDeva.me.name, () => {
  beforeEach(() => {
    return ErrorDeva.init()
  });
  it('Check the Deva Object', () => {
    expect(ErrorDeva).to.be.an('object');
    expect(ErrorDeva).to.have.property('agent');
    expect(ErrorDeva).to.have.property('vars');
    expect(ErrorDeva).to.have.property('listeners');
    expect(ErrorDeva).to.have.property('methods');
    expect(ErrorDeva).to.have.property('modules');
  });
})

const expect = require('chai').expect;

const buildOptions = require('../src/buildOptions');

describe('Build Options Function', () => {
  it('Returns an object with default options.', () => {
    expect(buildOptions({}, {})).to.deep.equal(
      { formatType: 'h', outputFormat: 'mm:ss', separator: ':' }
    );
  });

  it('Returns an object with amended outputFormat option', () => {
    expect(buildOptions({ outputFormat: 'ss' }, {})).to.deep.equal(
      { formatType: 'h', outputFormat: 'ss', separator: ':' }
    );
    expect(buildOptions({ outputFormat: 'hh:mm:ss' }, {})).to.deep.equal(
      { formatType: 'h', outputFormat: 'hh:mm:ss', separator: ':' }
    );
  });

  it('Throws an error when outputFormat is not a string', () => {
    expect(buildOptions.bind(buildOptions, { outputFormat: {} })).to.throw(TypeError);
    expect(buildOptions.bind(buildOptions, { outputFormat: {} })).to.throw(
      'Expected outputFormat to be a string, instead got: object'
    );
  });

  it('Throws an error when outputFormat is invalid', () => {
    expect(buildOptions.bind(buildOptions, { outputFormat: 'invalid' })).to.throw(Error);
    expect(buildOptions.bind(buildOptions, { outputFormat: 'invalid' })).to.throw(
      'Expected outputFormat to be: hh:mm:ss, mm:ss (default) ' +
      'or ss; instead got: invalid'
    );
  });

  it('Returns an object with amended separator option', () => {
    expect(buildOptions({ separator: '-' }, {})).to.deep.equal(
      { formatType: 'h', outputFormat: 'mm:ss', separator: '-' }
    );
    expect(buildOptions({ separator: 'boop' }, {})).to.deep.equal(
      { formatType: 'h', outputFormat: 'mm:ss', separator: 'boop' }
    );
  });

  it('Throws an error if value provided to separator is not a string', () => {
    expect(buildOptions.bind(buildOptions, { separator: () => {} })).to.throw(TypeError);
    expect(buildOptions.bind(buildOptions, { separator: () => {} })).to.throw(
      'Expected separator to be a string, instead got: function'
    );
  });

  it('Throws an error if formatType is not a string', () => {
    expect(buildOptions.bind(buildOptions, { formatType: 5 })).to.throw(TypeError);
    expect(buildOptions.bind(buildOptions, { formatType: 5 })).to.throw(
      'Expected formatType to be a string, instead got: number'
    );
  });

  it('Throws an error if formatType is not h, m or s', () => {
    expect(buildOptions.bind(buildOptions, { formatType: 'hey' })).to.throw(Error);
    expect(buildOptions.bind(buildOptions, { formatType: 'hey' })).to.throw(
      'Expected formatType to be: h, m or s; instead got: hey'
    );
  });

  it('Returns an object with amended formatType option', () => {
    expect(buildOptions({ formatType: 'm' }, {})).to.deep.equal(
      { formatType: 'm', outputFormat: 'mm:ss', separator: ':' }
    );
    expect(buildOptions({ formatType: 's' }, {})).to.deep.equal(
      { formatType: 's', outputFormat: 'mm:ss', separator: ':' }
    );
  });
});

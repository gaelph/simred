const deep = require('../lib/deep')

const { expect } = require('chai')

describe('Deep copy', function () {
  it('copies complex object', function () {
    const original = {
      date: new Date(),
      nested: {
        a: '3',
        b: 45.33,
        c: true
      },
      array: [
        12, 23, 3, 'fjdkf'
      ]
    }

    const copy = deep.copy(original)

    expect(copy).to.deep.equal(original)
    expect(original === copy).to.be.false
  })
})

describe('Deep equal', function () {
  it('undefined and null', function () {
    expect(deep.equal(undefined, undefined)).to.be.true
    expect(deep.equal(null, null)).to.be.true
    expect(deep.equal(null, undefined)).to.be.false
    expect(deep.equal(undefined, null)).to.be.false
  })

  it('strings', function () {
    expect(deep.equal('string', 'string')).to.be.true
    expect(deep.equal('string', 'strung')).to.be.false
  })

  it('numbers', function () {
    expect(deep.equal(23, 23)).to.be.true
    expect(deep.equal(23, 24)).to.be.false
  })

  it('plain objects', function () {
    expect(deep.equal({ a: 4, b: { c: 4 } }, { a: 4, b: { c: 4 } })).to.be.true
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, b: { c: 4 } })).to.be.false
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, b: 'string' })).to.be.false
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, g: { f: 56 } })).to.be.false
    expect(deep.equal({ a: 5, b: { h: 4 } }, { a: 4, g: { f: 56 } })).to.be.false
  })

  it('classes', function () {
    class A {
      constructor(a) {
        this.a = a
      }
    }

    class B {
      constructor(b) {
        this.b = b
      }
    }

    const a23 = new A(23)
    const a34 = new A(34)
    const b23 = new B(23)

    expect(deep.equal(a23, new A(23))).to.be.true
    expect(deep.equal(a23, a34)).to.be.false
    expect(deep.equal(a23, b23)).to.be.false
  })
})

describe('Deep Merge', function () {
  it('string', function () {
    expect(deep.merge('a', 'b')).to.equal('b')
  })

  it('numbers', function () {
    expect(deep.merge(56, 67)).to.equal(67)
  })

  it('objects', function () {
    const target = {}
    const source = {
      a: 45,
      b: {
        c: 'string'
      }
    }

    expect(deep.merge(target, source)).to.deep.equal(source)
  })
})
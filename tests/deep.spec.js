const deep = require('../lib/deep')

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

    expect(copy).toMatchObject(original)
    expect(original === copy).toBeFalsy()
  })
})

describe('Deep equal', function () {
  it('undefined and null', function () {
    expect(deep.equal(undefined, undefined)).toBeTruthy()
    expect(deep.equal(null, null)).toBeTruthy()
    expect(deep.equal(null, undefined)).toBeFalsy()
    expect(deep.equal(undefined, null)).toBeFalsy()
  })

  it('strings', function () {
    expect(deep.equal('string', 'string')).toBeTruthy()
    expect(deep.equal('string', 'strung')).toBeFalsy()
  })

  it('numbers', function () {
    expect(deep.equal(23, 23)).toBeTruthy()
    expect(deep.equal(23, 24)).toBeFalsy()
  })

  it('plain objects', function () {
    expect(deep.equal({ a: 4, b: { c: 4 } }, { a: 4, b: { c: 4 } })).toBeTruthy()
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, b: { c: 4 } })).toBeFalsy()
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, b: 'string' })).toBeFalsy()
    expect(deep.equal({ a: 5, b: { c: 4 } }, { a: 4, g: { f: 56 } })).toBeFalsy()
    expect(deep.equal({ a: 5, b: { h: 4 } }, { a: 4, g: { f: 56 } })).toBeFalsy()
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

    expect(deep.equal(a23, new A(23))).toBeTruthy()
    expect(deep.equal(a23, a34)).toBeFalsy()
    expect(deep.equal(a23, b23)).toBeFalsy()
  })
})

describe('Deep Merge', function () {
  it('string', function () {
    expect(deep.merge('a', 'b')).toBe('b')
  })

  it('numbers', function () {
    expect(deep.merge(56, 67)).toBe(67)
  })

  it('objects', function () {
    const target = {}
    const source = {
      a: 45,
      b: {
        c: 'string'
      }
    }

    expect(deep.merge(target, source)).toMatchObject(source)
  })
})
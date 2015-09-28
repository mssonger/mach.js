# mach.js
Simple mocking framework for Lua inspired by CppUMock and designed for readability

## Mocking a Function

```javascript
var mach = require('mach');

var f = mach.mockFunction();

f.shouldBeCalled().when(function() {
  f();
});
```

## Mocking an Object

```javascript
var mach = require('mach');

var someObject = {
  foo: function() {},
  bar: function() {}
};

mockedObject = mach.mockObject(someObject);

mockedObject.foo.shouldBeCalled().when(function() {
  mockedObject.foo();
});
```

## Multiple Expectations

```javascript
var mach = require('mach');

var f1 = mach.mockFunction();
var f2 = mach.mockFunction();

f1.shouldBeCalled()
  .andAlso(f2.shouldBeCalled())
  .when(function() {
    f1();
    f2();
  });
```

## Optional Expectations

```javascript
var mach = require('mach');

var f = mach.mockFunction();

f.mayBeCalled().when(function() {});
```

## Optional Ordering

```javascript
var mach = require('mach');

var f = mach.mockFunction();

// Use andThen or then when order is important
f.shouldBeCalledWith(1)
  .andThen(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // Error, out of order call
    f(1);
  });

f.shouldBeCalledWith(1)
  .then(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // Error, out of order call
    f(1);
  });

// Use andAlso or and when order is unimportant
f.shouldBeCalledWith(1)
  .andAlso(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // No error, order is not fixed when 'andAlso' is used
    f(1);
  });

f.shouldBeCalledWith(1)
  .and(f.shouldBeCalledWith(2))
  .when(function() {
    f(2); // No error, order is not fixed when 'and' is used
    f(1);
  });
```

## Mixed Ordering

```javascript
var mach = require('mach');

var f = mach.mockFunction();

f.shouldBeCalledWith(1)
  .and(f.shouldBeCalledWith(2))
  .then(f.shouldBeCalledWith(3))
  .and(f.shouldBeCalledWith(4))
  .when(function() {
    f(2);
    f(1);
    f(4);
    f(3);
  });
```

## Flexible Syntax

```javascript
var mach = require('mach');

var f1 = mach.mockFunction();
var f2 = mach.mockFunction();

function somethingShouldHappen() {
  return f1.shouldBeCalled();
}

function anotherThingShouldHappen() {
  return f2.shouldBeCalledWith(1, 2, 3);
}

function theCodeUnderTestRuns() {
  f1();
  f2(1, 2, 3);
}

// Actual test.
somethingShouldHappen()
  .and(anotherThingShouldHappen())
  .when(theCodeUnderTestRuns);
```

describe('mach', function() {
  var mach = require('./../index.js');
  var f = mach.mockFunction('f');
  var f1 = mach.mockFunction('f1');
  var f2 = mach.mockFunction('f2');

  it('should allow anonymous mocks', function() {
    var anonymousMock = mach.mockFunction();

    anonymousMock.shouldBeCalled().when(function() {
      anonymousMock();
    });
  });

  it('should be able to verify that a function is called', function() {
    f.shouldBeCalled().when(function() {
      f();
    });
  });

  it('should fail when an expected function call does not occur', function() {
    shouldFailWith('Not all calls occurred', function() {
      f.shouldBeCalled().when(function() {});
    });
  });

  it('should fail when a different mock is called instead of the expected mock', function() {
    shouldFailWith('Unexpected function call f2()', function() {
      f1.shouldBeCalled().when(function() {
        f2();
      });
    });
  });

  it('should fail when a function is called unexpectedly', function() {
    shouldFailWith('Unexpected function call f()', function() {
      f();
    });
  });

  it('should fail when a function is called unexpectedly after a successful expectation', function() {
    f.shouldBeCalled().when(function() {
      f();
    });

    shouldFailWith('Unexpected function call f()', function() {
      f();
    });
  });

  it('should be able to verify that a function has been called with the correct arguments', function() {
    f.shouldBeCalledWith(1, '2').when(function() {
      f(1, '2');
    });
  });

  it('should fail when a function is called with incorrect arguments', function() {
    shouldFailWith('Unexpected arguments (1, \'3\') provided to function f', function() {
      f.shouldBeCalledWith(1, '2').when(function() {
        f(1, '3');
      });
    });
  });

  it('should be able to verify that a function is called with any arguments', function() {
    f1.shouldBeCalledWithAnyArguments().when(function() {
      f1();
    });

    f1.shouldBeCalledWithAnyArguments().when(function() {
      f1(1, 'hi');
    });

    shouldFailWith('Not all calls occurred', function() {
      f.shouldBeCalledWithAnyArguments().when(function() {});
    });
  });

  it('should be able to have a soft expectation for a call with any arguments', function() {
    f1.mayBeCalledWithAnyArguments().when(function() {});

    f1.mayBeCalledWithAnyArguments().when(function() {
      f1(1, 'hi');
    });
  });

  it('should allow the return value of a mocked function to be specified', function() {
    f.shouldBeCalled().andWillReturn(4).when(function() {
      expect(f()).toBe(4);
    });
  });

  it('should allow multiple function calls to be expected', function() {
    f.shouldBeCalled().andAlso(f.shouldBeCalledWith(1, 2, 3)).when(function() {
      f();
      f(1, 2, 3);
    });
  });

  it('should fail if multiplle function calls are expected but not all occur', function() {
    shouldFailWith('Not all calls occurred', function() {
      f.shouldBeCalled().andAlso(f.shouldBeCalledWith(1, 2, 3)).when(function() {
        f(1, 2, 3);
      });
    });
  });

  it('should be able to verify that multiple functions are called', function() {
    f1.shouldBeCalled().andAlso(f2.shouldBeCalledWith(1, 2, 3)).when(function() {
      f1();
      f2(1, 2, 3);
    });
  });

  it('should allow an existing function to be mocked', function() {
    function f() {}
    var fMock = mach.mockFunction(f);

    shouldFailWith('Unexpected function call f()', function() {
      fMock();
    });
  });

  it('should allow functions to be used to improve readability', function() {
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

    somethingShouldHappen().
    andAlso(anotherThingShouldHappen()).
    when(theCodeUnderTestRuns);
  });

  it('should allow an object containing functions to be mocked', function() {
    var someObject = {
      foo: function() {},
      bar: function() {}
    };

    mockedObject = mach.mockObject(someObject, 'someObject');

    mockedObject.foo.shouldBeCalledWith(1)
      .andAlso(mockedObject.bar.shouldBeCalled())
      .when(function() {
        mockedObject.foo(1);
        mockedObject.bar();
      });
  });

  it('should copy non-function fields to a mocked object', function() {
    var someObject = {
      foo: function() {},
      bar: function() {},
      baz: 3
    };

    mockedObject = mach.mockObject(someObject, 'someObject');

    expect(mockedObject.baz).toBe(3);
  });

  it('should let you expect a function to be called multiple times', function() {
    f.shouldBeCalledWith(2).andWillReturn(1).multipleTimes(3).when(function() {
      expect(f(2)).toBe(1);
      expect(f(2)).toBe(1);
      expect(f(2)).toBe(1);
    });
  });

  it('should fail if a function is not called enough times', function() {
    shouldFailWith('Not all calls occurred', function() {
      var f = mach.mockFunction();

      f.shouldBeCalledWith(2).multipleTimes(3).when(function() {
        f(2);
        f(2);
      });
    });
  });

  it('should fail if a function is called too many times', function() {
    shouldFailWith('Unexpected function call f(2)', function() {
      f.shouldBeCalledWith(2).multipleTimes(2).when(function() {
        f(2);
        f(2);
        f(2);
      });
    });
  });

  it('should allow after to be used as an alias for when', function() {
    var f = mach.mockFunction();

    f.shouldBeCalled().after(function() {
      f();
    });
  });

  it('should allow and to be used as an alias for andAlso', function() {
    f.shouldBeCalled().and(f.shouldBeCalledWith(1, 2, 3)).when(function() {
      f();
      f(1, 2, 3);
    });
  });

  it('should fail if andWillReturn is not preceeded by shouldBeCalled or shouldBeCalledWith', function() {
    shouldFail(function() {
      f.andWillReturn(1);
    });
  });

  it('should fail if when is not preceeded by shouldBeCalled or shouldBeCalledWith', function() {
    shouldFail(function() {
      f.when(function() {});
    });
  });

  it('should fail if after is not preceeded by shouldBeCalled or shouldBeCalledWith', function() {
    shouldFail(function() {
      f.after(function() {});
    });
  });

  it('should fail if shouldBeCalled is used after a call has already been specified', function() {
    shouldFail(function() {
      f.shouldBeCalled().shouldBeCalled();
    });
  });

  it('should fail if shouldBeCalledWith is used after a call has already been specified', function() {
    shouldFail(function() {
      f.shouldBeCalled().shouldBeCalledWith(4);
    });
  });

  it('should allow calls to happen out of order when andAlso is used', function() {
    f1.shouldBeCalled()
      .andAlso(f2.shouldBeCalled())
      .when(function() {
        f2();
        f1();
      });

    f1.shouldBeCalledWith(1)
      .andAlso(f1.shouldBeCalledWith(2))
      .when(function() {
        f1(2);
        f1(1);
      });
  });

  it('should not allow calls to happen out of order when andThen is used', function() {
    shouldFailWith('Out of order function call f2()', function() {
      f1.shouldBeCalled()
        .andThen(f2.shouldBeCalled())
        .when(function() {
          f2();
          f1();
        });
    });

    shouldFailWith('Unexpected arguments (2) provided to function f1', function() {
      f1.shouldBeCalledWith(1)
        .andThen(f2.shouldBeCalled(2))
        .when(function() {
          f1(2);
          f1(1);
        });
    });
  });

  it('should allow then to be used as a synonym for andThen', function() {
    shouldFailWith('Out of order function call f2()', function() {
      f1.shouldBeCalled()
        .then(f2.shouldBeCalled())
        .when(function() {
          f2();
          f1();
        });
    });
  });

  it('should catch out of order calls when mixed with unordered calls', function() {
    var f1 = mach.mockFunction('f1');
    var f2 = mach.mockFunction('f2');
    var f3 = mach.mockFunction('f3');

    shouldFailWith('Out of order function call f3()', function() {
      f1.shouldBeCalled()
        .and(f2.shouldBeCalled())
        .then(f3.shouldBeCalled())
        .when(function() {
          f2();
          f3();
          f1();
        });
    });
  });

  it('should allow ordered and unordered calls to be mixed', function() {
    f.shouldBeCalledWith(1)
      .andAlso(f.shouldBeCalledWith(2))
      .andThen(f.shouldBeCalledWith(3))
      .andAlso(f.shouldBeCalledWith(4))
      .when(function() {
        f(2);
        f(1);
        f(4);
        f(3);
      });
  });

  it('should allow you to mix and match call types', function() {
    f1.shouldBeCalled()
      .andAlso(f2.shouldBeCalledWith(1, 2, 3))
      .andThen(f2.shouldBeCalledWith(1).andWillReturn(4))
      .when(function() {
        f1();
        f2(1, 2, 3);
        expect(f2(1)).toBe(4);
      });
  });

  it('should maintain independent expectations', function() {
    f.shouldBeCalled();

    f.shouldBeCalled().when(function() {
      f();
    });
  });

  it('should allow soft expectations to be called', function() {
    f.mayBeCalled().when(function() {
      f();
    });
  });

  it('should allow soft expectations to be omitted', function() {
    f.mayBeCalled().when(function() {});
  });

  it('should allow soft expectations with return values', function() {
    f.mayBeCalled().andWillReturn(3).when(function() {
      expect(f()).toBe(3);
    });
  });

  it('should allow soft expectations with arguments to be called', function() {
    f.mayBeCalledWith(4).when(function() {
      f(4);
    });

    f.mayBeCalledWith(4).when(function() {
      f(4);
    });
  });

  it('should allow soft expectations with arguments to be omitted', function() {
    f.mayBeCalledWith(4).when(function() {});
  });

  it('should fail if mayBeCalled is used after a call has already been specified', function() {
    shouldFail(function() {
      f.shouldBeCalled().mayBeCalled();
    });
  });

  it('should fail if mayBeCalledWith is used after a call has already been specified', function() {
    shouldFail(function() {
      f.shouldBeCalled().mayBeCalledWith(4);
    });
  });

  it('should handle object arguments in error messages', function() {
    var a = {};

    shouldFailWith('Unexpected function call f(' + a.toString() + ')', function() {
      mach.mockFunction('f')(a);
    });
  });

  it('should allow a strictly ordered call to occur after a missing optional call', function() {
    f1.mayBeCalled().andThen(f2.shouldBeCalled()).when(function() {
      f2();
    });
  });

  it('should not allow order to be violated for an optional call', function() {
    shouldFailWith('Unexpected function call f1()', function() {
      f1.mayBeCalled().andThen(f2.shouldBeCalled()).when(function() {
        f2();
        f1();
      });
    });
  });

  it('should indicate expectation status in unexpected call failures', function() {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, function() {
      f1.shouldBeCalled().andThen(f2.shouldBeCalled()).when(function() {
        f1();
        f1();
      });
    });
  });

  it('should indicate expectation status in unexpected arguments failures', function() {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, function() {
      f1.shouldBeCalled().andThen(f2.shouldBeCalled()).when(function() {
        f1();
        f2(1);
      });
    });
  });

  it('should indicate expectation status in out of order call failures', function() {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()\n' +
      '\tf1()';

    shouldFailWith(failureMessage, function() {
      f1.shouldBeCalled().andThen(f2.shouldBeCalled()).andThen(f1.shouldBeCalled()).when(function() {
        f1();
        f1();
      });
    });
  });

  it('should indicate expectation status when not all calls occur', function() {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1()\n' +
      'Incomplete calls:\n' +
      '\tf2()';

    shouldFailWith(failureMessage, function() {
      f1.shouldBeCalled().andThen(f2.shouldBeCalled()).when(function() {
        f1();
      });
    });
  });

  it('should omit the completed call listing when there are no completed calls', function() {
    var failureMessage =
      'Unexpected function call f2()\n' +
      'Incomplete calls:\n' +
      '\tf1()';

    shouldFailWithExactly(failureMessage, function() {
      f1.shouldBeCalled().when(function() {
        f2();
      });
    });
  });

  it('should omit the incomplete call listing when there are no incomplete calls', function() {
    var failureMessage =
      'Unexpected function call f2()\n' +
      'Completed calls:\n' +
      '\tf1()';

    shouldFailWithExactly(failureMessage, function() {
      f1.shouldBeCalled().when(function() {
        f1();
        f2();
      });
    });
  });

  it('should indicate when any args are allowed in call listing', function() {
    var failureMessage =
      'Completed calls:\n' +
      '\tf1(1, 2, 3)\n' +
      'Incomplete calls:\n' +
      '\tf1(<any>)';

    shouldFailWith(failureMessage, function() {
      f1.shouldBeCalledWithAnyArguments().multipleTimes(2).when(function() {
        f1(1, 2, 3);
        f2();
      });
    });
  });

  it('should show anonymous mocks in call listings', function() {
    var anonymousMock = mach.mockFunction();

    shouldFailWith('Incomplete calls:\n\t<anonymous>()', function() {
      anonymousMock.shouldBeCalled().when(function() {});
    });
  });

  it('should show methods mocked on anonymous objects in call listings', function() {
    var anonymousMockedObject = mach.mockObject({
      f: function() {}
    });

    shouldFailWith('Incomplete calls:\n\t<anonymous>.f()', function() {
      anonymousMockedObject.f.shouldBeCalled().when(function() {});
    });
  });

  it('should print arrays in calls properly', function() {
    shouldFailWith('Unexpected function call f([1, 2, 3])', function() {
      f([1, 2, 3]);
    });
  });

  it('should allow arguments to be checked for sameness', function() {
    f.shouldBeCalledWith(mach.same([1, 2, 3]))
      .when(function() {
        f([1, 2, 3]);
      });
  });

  it('should actually check for sameness', function() {
    shouldFail(function() {
      f.shouldBeCalledWith(mach.same([1, 2, 3]))
        .when(function() {
          f([3, 2, 1]);
        });
    });
  });

  it('should allow some arguments to be checked for sameness and some for equality', function() {
    shouldFail(function() {
      f.shouldBeCalledWith(mach.same([1, 2, 3]), [4, 5, 6])
        .when(function() {
          f([1, 2, 3], [4, 5, 6]);
        });
    });

    f.shouldBeCalledWith(mach.same([1, 2, 3]), 7)
      .when(function() {
        f([1, 2, 3], 7);
      });
  });

  it('should actually check for sameness', function() {
    var failureMessage = 'Incomplete calls:\n' + '\tf([1, 2, 3])';

    shouldFailWith(failureMessage, function() {
      f.shouldBeCalledWith(mach.same([1, 2, 3]))
        .when(function() {});
    });
  });

  it('should allow additional mocked calls to be ignored', function() {
    f1.shouldBeCalled().andOtherCallsShouldBeIgnored().when(function() {
      f1();
      f2();
    });
  });

  it('should allow mocked calls to be ignored', function() {
    var x;

    mach.ignoreMockedCallsWhen(function() {
      f();
      x = 4;
    });

    expect(x).toBe(4);
  });

  it('should fail when a function is called unexpectedly after calls are ignored', function() {
    mach.ignoreMockedCallsWhen(function() {
      f();
    });

    shouldFailWith('Unexpected function call f()', function() {
      f();
    });
  });
});

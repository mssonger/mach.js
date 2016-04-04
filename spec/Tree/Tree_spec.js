'use strict';

describe('Tree', () => {
  let Tree = require('../../src/Tree/Tree.js');
  let Node = require('../../src/Tree/Node.js');
  let TerminusNode = require('../../src/Tree/TerminusNode.js');
  let ExpectedCallNode = require('../../src/Tree/ExpectedCallNode.js');
  let AndNode = require('../../src/Tree/AndNode.js');
  let NotAllCallsOccurredError = require('../../src/Error/NotAllCallsOccurredError.js');

  it('should have a node when initialized', () => {
    let node = new ExpectedCallNode({
      name: 'foo'
    });

    let tree = new Tree(node);

    expect(tree._root.child).toEqual(node);
    expect(node.child instanceof TerminusNode).toBe(true);
  });

  describe('and', () => {
    it('ExpectedCallNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
      let a = new ExpectedCallNode({
        name: 'a'
      });

      let b = new ExpectedCallNode({
        name: 'b'
      });

      let tree = new Tree(a);

      tree.and(new Tree(b));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b }} [{ TERMINUS }] }] }');
    });

    it('ExpectedCallNode + AndNode => Root -> AndNode -> Terminus', () => {
      let a = new ExpectedCallNode({
        name: 'a'
      });

      let b = new AndNode({
        name: 'b'
      });

      b.merge(new AndNode({
        name: 'c'
      }));

      let tree = new Tree(a);

      tree.and(new Tree(b));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
    });

    it('AndNode + ExpectedCallNode => Root -> AndNode -> Terminus', () => {
      let a = new AndNode({
        name: 'a'
      });

      a.merge(new AndNode({
        name: 'b'
      }));

      let c = new ExpectedCallNode({
        name: 'c'
      });

      let tree = new Tree(a);

      tree.and(new Tree(c));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b, c }} [{ TERMINUS }] }] }');
    });

    it('AndNode + AndNode => Root -> AndNode -> Terminus', () => {
      let a = new AndNode({
        name: 'a'
      });

      a.merge(new AndNode({
        name: 'b'
      }));

      let c = new AndNode({
        name: 'c'
      });

      c.merge(new AndNode({
        name: 'd'
      }));

      let tree = new Tree(a);

      tree.and(new Tree(c));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b, c, d }} [{ TERMINUS }] }] }');
    });

    it('should throw an error if current node is invalid type', () => {
      let a = new Node('a');

      let tree = new Tree(a);

      expect(() => tree.and(new Tree(new Node('b'))))
        .toThrowError('Unexpected type for this node, expected AndNode or ExpectedCallNode');
    });
  });

  describe('then', () => {
    it('ExpectedCallNode -> ExpectedCallNode => Root -> ExpectedCallNode -> ExpectedCallNode -> Terminus', () => {
      let a = new ExpectedCallNode({
        name: 'a'
      });

      let b = new ExpectedCallNode({
        name: 'b'
      });

      let tree = new Tree(a);

      tree.then(new Tree(b));

      expect(tree.toString()).toEqual('{ ROOT [{ a [{ b [{ TERMINUS }] }] }] }');
    });

    it('ExpectedCallNode -> AndNode => Root -> ExpectedCallNode -> AndNode -> Terminus', () => {
      let a = new ExpectedCallNode({
        name: 'a'
      });

      let b = new AndNode({
        name: 'b'
      });

      b.merge(new AndNode({
        name: 'c'
      }));

      let tree = new Tree(a);

      tree.then(new Tree(b));

      expect(tree.toString()).toEqual('{ ROOT [{ a [{ AND {{ b, c }} [{ TERMINUS }] }] }] }');
    });

    it('AndNode -> ExpectedCallNode => Root -> AndNode -> ExpectedCallNode -> Terminus', () => {
      let a = new AndNode({
        name: 'a'
      });

      a.merge(new AndNode({
        name: 'b'
      }));

      let c = new ExpectedCallNode({
        name: 'c'
      });

      let tree = new Tree(a);

      tree.then(new Tree(c));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b }} [{ c [{ TERMINUS }] }] }] }');
    });

    it('AndNode -> AndNode => Root -> AndNode -> AndNode -> Terminus', () => {
      let a = new AndNode({
        name: 'a'
      });

      a.merge(new AndNode({
        name: 'b'
      }));

      let c = new AndNode({
        name: 'c'
      });

      c.merge(new AndNode({
        name: 'd'
      }));

      let tree = new Tree(a);

      tree.then(new Tree(c));

      expect(tree.toString()).toEqual('{ ROOT [{ AND {{ a, b }} [{ AND {{ c, d }} [{ TERMINUS }] }] }] }');
    });
  });

  describe('completedCalls / incompleteCalls', () => {
    it('should return status of all expected call', () => {
      let a = new ExpectedCallNode({
        name: 'a',
        completed: false
      });

      let b = new AndNode({
        name: 'b',
        completed: false
      });

      b.merge(new AndNode({
        name: 'c',
        completed: false
      }));

      let tree = new Tree(a);

      tree.then(new Tree(b));

      expect(tree.completedCalls.length).toEqual(0);
      expect(tree.incompleteCalls.length).toEqual(3);

      a.expectedCall.completed = true;

      expect(tree.completedCalls.length).toEqual(1);
      expect(tree.incompleteCalls.length).toEqual(2);

      b.expectedCalls[0].completed = true;

      expect(tree.completedCalls.length).toEqual(2);
      expect(tree.incompleteCalls.length).toEqual(1);

      b.expectedCalls[1].completed = true;

      expect(tree.completedCalls.length).toEqual(3);
      expect(tree.incompleteCalls.length).toEqual(0);
    });

    it('should throw an error if there is an invalid node type', () => {
      let a = new Node('node');

      let tree = new Tree(a);

      let error = 'Unexpected type for node, expected AndNode or ExpectedCallNode';
      expect(() => tree.completedCalls).toThrowError(error);
      expect(() => tree.incompleteCalls).toThrowError(error);
    });
  });

  it('checkCalls should return correct result based on completion state of its expected calls', () => {
    let a = new ExpectedCallNode({
      name: 'a',
      required: true,
      completed: false
    });

    let b = new AndNode({
      name: 'b',
      required: true,
      completed: false
    });

    b.merge(new AndNode({
      name: 'c',
      required: false,
      completed: false
    }));

    let tree = new Tree(a);

    tree.then(new Tree(b));

    expect(() => tree.checkCalls()).toThrowError(NotAllCallsOccurredError);

    a.expectedCall.completed = true;
    a.expectedCall.actualArgs = [];

    expect(() => tree.checkCalls()).toThrowError(NotAllCallsOccurredError);

    b.expectedCalls[0].completed = true;
    b.expectedCalls[0].actualArgs = [];

    expect(() => tree.checkCalls()).not.toThrowError(NotAllCallsOccurredError);

    b.expectedCalls[1].completed = true;
    b.expectedCalls[1].actualArgs = [];

    expect(() => tree.checkCalls()).not.toThrowError(NotAllCallsOccurredError);
  });
});

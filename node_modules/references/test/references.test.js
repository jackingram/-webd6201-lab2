const { Component, createRef } = require('react');
const { describe, it } = require('mocha');
const { render } = require('react-dom');
const references = require('../');
const assume = require('assume');
const React = require('react');

describe('references', function () {
  it('is exposed a function', function () {
    assume(references).is.a('function');
  });

  it('returns a mimics React.createRef\'s data structure', function () {
    const theirs = createRef();
    const ours = references();
    const instance = {};

    assume(theirs).is.a('object');

    theirs.current = instance;
    assume(theirs.current).equals(instance);
    assume(theirs.current = 'bar').equals('bar');

    assume(ours).is.a('object');
    assume(ours.current).is.a('null');

    ours.current = instance;
    assume(ours.current).equals(instance);
    assume(ours.current = 'bar').equals('bar');
  });

  it('creates a new ref using create()', function () {
    const ref = references();
    const label = ref.create('label');

    assume(label).is.a('object');
    assume(label.current).is.a('null');

    label.current = 'foo';
    assume(label.current).equals('foo');
  });

  it('throws an error when ref is created without a name', function (next) {
    const ref = references();

    try { ref.create() }
    catch (e) {
      assume(e).is.a('error');
      assume(e.message).equals('The created reference needs a name');

      next();
    }
  });

  it('can spread and forward', function () {
    const ref = references();

    const spread = ref.foward('foo');

    assume(spread).is.a('object');
    assume(spread.ref).is.a('object');
    assume(spread.references).is.a('object');
    assume(spread.ref).equals(spread.references);
  });

  it('can find created "child" references', function () {
    const ref = references();
    const label = ref.create('label');

    label.current = 'foo';

    const found = ref.get('label');
    assume(found).equals('foo');
  });

  it('supports deep chaining using dot notation', function () {
    const ref = references();
    const container = ref.create('container');
    const header = container.create('header');
    const smol = header.create('smol');

    container.current = 'waddup';
    header.current = 'sup';
    smol.current = 'ohai';

    assume(ref.get('container.header.smol')).equals('ohai');
    assume(ref.get('container.header')).equals('sup');
    assume(container.get('header')).equals('sup');
    assume(container.get('header.smol')).equals('ohai');
  });

  describe('integration', function () {
    class Container extends Component {
      render() {
        return (
          <div className="container">
            {
              React.Children.map(this.props.children, (kid) => {
                return React.cloneElement(kid, this.props);
              })
            }
          </div>
        );
      }
    }

    class Header extends Component {
      render() {
        return (
          <header className={ this.props.header }>
            { this.props.children }
          </header>
        );
      }
    }

    class Smol extends Component {
      render() {
        return (
          <small>{ this.props.children }</small>
        );
      }
    }

    class App extends Component {
      constructor() {
        super(...arguments);

        this.references = references();
      }

      componentDidMount() {
        this.props.assert(this.references);
      }

      render() {
        const ref = this.references[this.props.method];

        return (
          <Container ref={ ref('container') } header='bar'>
            <Header ref={ ref('header') }>
              <Smol ref={ ref('smol') }>tiny text is tiny</Smol>
            </Header>
          </Container>
        );
      }
    }

    it('can be used as an alternative to React.createRef', function (next) {
      const target = document.createElement('div');

      function assert(refs) {
        const header = refs.get('header');
        const container = refs.get('container');

        assume(container.props.header).equals('bar');
        assume(header.props.header).equals('bar');
        next();
      }

      render(<App method='create' assert={ assert } />, target);
    });
  });
});

# references

The `references` library allows you to create named references which allows you
to easily track multiple references from a single location. You can use
one instance to manage all references, or even

## Installation

The `references` library is released in the public npm registry and can be
installed by running:

```
npm install --save references
```

## Usage

The library is designed to be a replacement of the `React.createRef` function
that ships in React, this is possible because it uses the same object
structure.

```js
const refs = require('references');

const ref = refs();
console.log(ref.current);
```

### create(name)

Create a new named reference. The name later be used to retrieve the ref
using the `get` method. The name argument is **required** and should be
unique for the created `reference` instance.

```js
const refs = require('references');
const ref = refs();

const label = ref.create('label');

<Component ref={ label } />
```

### forward(name)

It returns an object that should be spread on the component. It will introduce
the following properties:

- `ref` Created reference with the supplied name.
- `references` Reference to the references instance, so you can chain them.

```js
const refs = require('references');
const ref = refs();

const label = ref.forward('label');
<Component { ...forward } />
```

### get(name)

The `get` method allows you to find the references that were created. It
accepts a single argument, which is the name of the ref that was created.
It's possible that a ref was created from another reference, in that case
you can use the dot notation reference the created ref.

```js
const refs = require('references');

const ref = refs();
const input = ref.create('input');    // This is what you pass to your components
const header = ref.create('header');  // using the `ref` property:
const label = header.create('label'); // <Example ref={ ref.create('example') } />

console.log(ref.get('input'));        // Points to the `input` ref
console.log(ref.get('header'));       // Points to the `header` ref
console.log(ref.get('label'));        // Returns null, as label was created as child of header
console.log(ref.get('header.label')); // Points to the `label` ref
console.log(header.get('label'));     // Points to the `label` ref
```

## Example

```js
import React, { Component } from 'react';
import references from 'references';

class Example extends Component {
  constructor() {
    super(...arguments);

    this.references = this.props.references || references();
  }

  render() {
    const refs = this.references;

    return (
      <Container ref={ refs /* references() it self can also be used as ref */ }>
        <Header { ...refs.forward('header') }>
          <Smol ref={ ref.create('smol') }>tiny text here</Smol>
        </Header>
      </Container>
    )
  }
}
```

```js
<Example />
```

The `<Example />` will now have the following references created:

- `` (Just `ref.get()` without any arguments )
- `header`
- `header.title`
- `smol`

```js
const refs = references();
<Example {...refs.forward('foo') } />
```

The `<Example />` will now have the following references created:

- `foo`
- `foo.header`
- `foo.header.title`
- `foo.smol`

## License

[MIT](./LICENSE)

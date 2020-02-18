/**
 * @typedef {object} ReferenceOptions
 * @prop {map} [map] The Map instance where store all our references.
 * @prop {string} [root] The root or parent name of the references.
 */
/**
 * Create reference tree that can be easily resolved.
 *
 * @param {ReferenceOptions} [options] Optional configuration.
 * @returns {object} Object that follows the structure as React.createRef.
 * @public
 */
function references({ map = new Map(), root = '' } = {}) {
  //
  // We can't use Object.create(null) here because the React internals
  // will fail on a missing hasOwnProperty on the object.
  //
  const result = {};

  /**
   * Helper function to create the namespaces in our maps.
   */
  function namespace(first, second) {
    return [first, second].filter(Boolean).join('.');
  }

  /**
   * Apply additional transformations to a reference.
   *
   * @param {string} [path] Path of the reference you want to find.
   * @returns {null|React.Component} The found reference.
   * @public
   */
  function get(path = '', prefix = root) {
    const value = map.get(namespace(prefix, path));

    if (!value) return null;
    return value;
  }

  /**
   * Set a new value for the reference.
   *
   * @param {Mixed} inst The data for the reference.
   * @returns {Mixed} The first argument.
   * @public
   */
  function set(inst) {
    if (inst) map.set(root, inst);
    else map.delete(root);

    return inst;
  }

  /**
   * Create a new linked reference.
   *
   * @param {string} name The name of the reference.
   * @returns {object} Object that follows the structure as React.createRef.
   * @public
   */
  function create(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('The created reference needs a name');
    }

    return references({
      root: namespace(root, name),
      map
    });
  }

  /**
   * Create ref, but also forward the references to the component.
   *
   * @param {string} name Name of the reference.
   * @returns {object} Properties that should be spread on a component.
   * @public
   */
  function forward(name) {
    const ref = create(name);
    return { ref, references: ref };
  }

  Object.defineProperty(result, 'forward', { value: forward });
  Object.defineProperty(result, 'create', { value: create });
  Object.defineProperty(result, 'current', { get, set });
  Object.defineProperty(result, 'get', { value: get });

  return result;
}

//
// Expose the module.
//
module.exports = references;

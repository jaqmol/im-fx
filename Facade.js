import React from 'react';
import PropTypes from 'prop-types';
import StateTree from './StateTree';

function mappingsList (mappings) {
  if (mappings instanceof Array) {
    return mappings.map(val => [val, val]);
  } else {
    return Object.keys(mappings).map(key => [key, mappings[key]]);
  }
}

function stateBoundFacade(tree, initFn, renderFn) {
  return class Facade extends React.Component {
    componentWillMount () {
      const mappings = mappingsList(initFn(this.props));
      this.listenerRemovers = mappings.map(([keyPath, stateName]) => {
        return tree.observe(keyPath, change => {
          this.setState(Object.assign({}, this.state, {
            [stateName]: change
          }));
        });
      });
    }
    componentWillUnmount () {
      this.listenerRemovers.forEach(removeFn => removeFn());
    }
    render() {
      return renderFn(this.state, this.props);
    }
  };
}

function extractArgs (args) {
  let tree = null;
  let secondArg = null;
  let renderFn = null;
  if (args.length === 2) {
    tree = StateTree.get();
    secondArg = args[0];
    renderFn = args[1];
  } else if (args.length === 3) {
    tree = args[0];
    secondArg = args[1];
    renderFn = args[2];
  }
  return [ tree, secondArg, renderFn ];
}

const Facade = {
  state: (...args) => {
    const [ tree, mapping, renderFn ] = extractArgs(args);
    if (!tree || !mapping || !renderFn) {
      throw new Error('Call with either (<state-mapping>, <render-fn>) or (<tree>, <state-mapping>, <render-fn>)');
    }
    return stateBoundFacade(tree, () => mapping, renderFn);
  },
  props: (...args) => {
    const [ tree, mapping, renderFn ] = extractArgs(args);
    if (!tree || !mapping || !renderFn) {
      throw new Error('Call with either (<state-mapping>, <render-fn>) or (<tree>, <state-mapping>, <render-fn>)');
    }
    const comp = stateBoundFacade(tree, props => {
      // if (!props) throw new Error('No props providing bound key-paths.');
      return Object.keys(mapping).reduce((acc, name) => {
        const keyPath = props[name];
        if (keyPath) {
          acc[keyPath] = mapping[name];
        } else {
          throw new Error(`Prop "${name}" binding key-path to facade-state is mandatory!`);
        }
        return acc;
      }, {});
    }, renderFn);
    comp.propTypes = Object.keys(mapping).reduce((acc, name) => {
      acc[name] = PropTypes.string.isRequired;
      return acc;
    }, {});
    return comp;
  }
};

export default Facade;

import RouteParser from 'route-parser';
import StateTree from './StateTree';
// const ALL_LISTENERS = Symbol('ALL_LISTENERS');
// const PARSER = Symbol('PARSER');
const allRoutes = {};

class RouteState {
  constructor (identifier, params) {
    this.id = identifier;
    this.params = params;
  }
}

function extractArgs (args) {
  let tree = null;
  let keyPath = null;
  if (args.length === 1) {
    tree = StateTree.get();
    keyPath = args[0];
  } else if (args.length === 2) {
    tree = StateTree.get(args[0]);
    keyPath = args[1];
  }
  return [tree, keyPath];
}

function initSpecificRoute (tree, keyPath) {
  return function SpecificRoute (definition, identifier) {
    if (!(this instanceof SpecificRoute)) {
      return new SpecificRoute(definition, identifier);
    }
    identifier = identifier || definition;
    const parser = new RouteParser(definition);
    const onLocationChange = () => {
      const href = window.location.href;
      const hashIndex = href.indexOf('#');
      if (!hashIndex) return;
      const tail = href.slice(hashIndex + 1);
      const match = parser.match(tail);
      if (!match) return;
      tree.mutate(keyPath, new RouteState(identifier, match));
    };
    window.addEventListener('load', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    allRoutes[identifier] = this;
    this.link = (params) => {
      return '#' + parser.reverse(params);
    };
  };
}

const Route = {
  get: identifier => {
    const r = allRoutes[identifier];
    if (!r) throw new Error(`Route "${identifier}" not found`);
    return r;
  },
  link: (identifier, params) => Route.get(identifier).link(params),
  init: (...args) => {
    const [ tree, keyPath ] = extractArgs(args);
    if (!tree || !keyPath) {
      throw new Error('Call with either (<key-path>) or (<state-tree>, <key-path>)');
    }
    return initSpecificRoute(tree, keyPath);
  }
};

export default Route;

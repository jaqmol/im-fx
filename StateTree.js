import { fromJS, Map, List } from 'immutable';
let allInstances = Map({});
const INIT = Symbol('INIT');
const STATE = Symbol('STATE');
const ALL_MUTATE_LISTENERES = Symbol('ALL_MUTATE_LISTENERES');
const NOT_FOUND = Symbol('NOT_FOUND');

function getCreateInstance (name) {
  let instance = allInstances.get(name);
  if (!instance) {
    instance = new StateTree();
    allInstances = allInstances.set(name, instance);
  }
  return instance;
}

function addOnMutateListener (instance, keyPath, callback) {
  let allMutateListeners = instance[ALL_MUTATE_LISTENERES];
  let allCallbacksForKey = allMutateListeners.get(keyPath, List());
  const removeIndex = allCallbacksForKey.size;
  allCallbacksForKey = allCallbacksForKey.push(callback);
  allMutateListeners = allMutateListeners.set(keyPath, allCallbacksForKey);
  instance[ALL_MUTATE_LISTENERES] = allMutateListeners;
  return removeIndex
}
function dispatchMutateEvent (instance, keyPath, original, change) {
  let allMutateListeners = instance[ALL_MUTATE_LISTENERES];
  const allCallbacksForKey = allMutateListeners.get(keyPath);
  if (allCallbacksForKey) {
    for (let callback of allCallbacksForKey) {
      callback(change, original);
    }
    return true;
  }
  return false;
}
function removeOnMutateListener (instance, keyPath, index) {
  let allMutateListeners = instance[ALL_MUTATE_LISTENERES];
  let allCallbacksForKey = allMutateListeners.get(keyPath);
  allCallbacksForKey = allCallbacksForKey.delete(index);
  allMutateListeners = allMutateListeners.set(keyPath, allCallbacksForKey);
  instance[ALL_MUTATE_LISTENERES] = allMutateListeners;
}

function applyIfChange (instance, ikp, keyPath, original, change) {
  if (original !== change) {
    instance[STATE] = instance[STATE].setIn(ikp, change);
    dispatchMutateEvent(instance, keyPath, original, change);
    return true;
  }
  return false;
}

export default class StateTree {
  constructor () {
    this[STATE] = Map();
    this[INIT] = (initialState) => {
      this[STATE] = fromJS(initialState);
      if (!(this[STATE] instanceof Map)) throw new Error('Initial state must be JS object');
      return this
    };
    this[ALL_MUTATE_LISTENERES] = Map();
  }
  value (keyPath) {
    const ikp = keyPath.split('.');
    return this[STATE].getIn(ikp, NOT_FOUND);
  }
  mutate (keyPath, valueOrCallback) {
    const ikp = keyPath.split('.');
    const original = this[STATE].getIn(ikp);
    const change = typeof valueOrCallback === 'function'
      ? valueOrCallback(original)
      : valueOrCallback;
    if (change.then && change.catch) {
      return change.then(changeResult => {
        return applyIfChange(this, ikp, keyPath, original, changeResult);
      });
    } else {
      return applyIfChange(this, ikp, keyPath, original, change);
    }
  }
  observe (keyPath, callback) {
    const removeIndex = addOnMutateListener(this, keyPath, callback);
    const value = this[STATE].getIn(keyPath.split('.'), NOT_FOUND);
    if (value !== NOT_FOUND) callback(value);
    const removeListener = () => {
      removeOnMutateListener(this, keyPath, removeIndex);
    };
    return removeListener;
  }
}
StateTree.NOT_FOUND = NOT_FOUND;
StateTree.init = (...args) => {
  let name, initialState
  if (args.length === 2) {
    name = args[0]
    initialState = args[1]
  } else if (args.length === 1) {
    name = 'main'
    initialState = args[0]
  } else throw new Error('Call with (initialState) or (name, initialState)')
  return getCreateInstance(name)[INIT](initialState);
}
StateTree.get = name => {
  name = name || 'main';
  return getCreateInstance(name);
}
StateTree.value = kp => StateTree.get().value(kp)
StateTree.mutate = (kp, cb) => StateTree.get().mutate(kp, cb)
StateTree.observe = (kp, cb) => StateTree.get().observe(kp, cb)

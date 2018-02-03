import { Map } from 'immutable';

export default function DataModel (...props) {
  return function SpecificDataModel (data) {
    if (!(this instanceof SpecificDataModel)) {
      return new SpecificDataModel(data);
    }
    if (data instanceof Map) {
      for (let prop of props) {
        this[prop] = data.get(prop);
      }
    } else {
      for (let prop of props) {
        this[prop] = data[prop];
      }
    }
    Object.freeze(this);
  };
}

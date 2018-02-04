<img src="https://github.com/jaqmol/im-fx/raw/master/accessory/icon.png" width="75" />

# Immutable FX (IM-FX)

The fulcrum is to be as minimal an extension to React as possible, while covering all the aspects needed to become fully functional, in the sense of functional programming and functional requirements to write full-featured apps. Thus *Immutable Functional Reactive Programming Micro-Extension to [React](https://reactjs.org/),* covering:

- A real single immutable state tree
- Pure functional reactive components
- Built with async in mind
- Concepts to reduce LOCs in real world apps

[See IM-FX wiki for documentation](https://github.com/jaqmol/im-fx/wiki/Concepts)

## Immutable State Tree,

based on [ImmutableJS](https://facebook.github.io/immutable-js/) and the concept of key-path-observation. Compared to react-redux, greatly reduces LOCs for passing around action handlers, as well as reducers.

## Facade,

based on React higher-order components. Directly bind properties of functional React components to state-tree values via key-paths. No cumbersome container components, no class based components, fewer LOCs.

## Routing,

is concise, centralised, expressive and clean. On purpose, IM-FX routing is not polluting your JSX.

## Based On

- ImmutableJS
- React
- ReactScripts
- RouteParser

## If you like what you read

Check it out and [read on in the wiki.](https://github.com/jaqmol/im-fx/wiki/Concepts)

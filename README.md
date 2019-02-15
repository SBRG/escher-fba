# Escher-FBA

## Getting started

To run Escher-FBA, you will need Node and NPM or Yarn. To start a development server, from the root directory, run:

```
yarn install
yarn start
```

or 

```
npm install
npm start
```

You can also build a production build with `yarn/npm build` which will generate a new `build` folder with a `index.html` entrypoint.

## Embedding

The Preact component for the main Escher-FBA app is the `App` component in `src/App.js`. You should be able to import and run this component from other Preact apps.

If you want to include Escher-FBA within a React app, you could try this guide: https://swizec.com/blog/seamlessly-render-preact-component-react-project/swizec/8224 Alternatively, it would be simple to migrate the codebase to React.

Our eventual goal for embedding Escher-FBA will be to provide a vanilla JavaScript API like the one available for Escher.

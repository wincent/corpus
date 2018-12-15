module.exports = function(api) {
  api.cache(false);

  return {
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-syntax-object-rest-spread",
      "@babel/plugin-transform-react-constant-elements",
      "@babel/plugin-transform-react-inline-elements"
    ],
    presets: [
      ["@babel/preset-env", {
        debug: false,
        targets: "electron 3.0",
        useBuiltIns: "entry",
      }],
      "@babel/preset-flow",
      "@babel/preset-react",
    ]
  };
}

require('file-loader');
require('babel-register')({
  ignore: [/(node_modules)/],
  presets: [
    [
      'env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ]
});
require('./src/index');

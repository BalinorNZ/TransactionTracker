var path = require('path');
var WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  entry: {
    //tutorial: './views/jsx/todos.jsx',//'./views/jsx/index.jsx',
    app: './views/app/index.jsx',
  },

  devServer: {
    outputPath: path.join(__dirname, 'assets/js'),
    stats: { chunks: false }
  },

  output: {
    path: path.resolve(__dirname, 'assets/js'),
    filename: '[name].js',
    publicPath: 'http://localhost:8080/js/',
  },

  devtool: 'source-map',

  resolve: {
    root: [
      path.resolve(__dirname, 'views/app'),
      path.resolve(__dirname, 'views/jsx'),
    ],
    extensions: ['', '.js', '.jsx']
  },

  plugins: [
    new WriteFilePlugin()
  ],

  module: {
    loaders: [
      { test: [/\.js$/, /\.jsx$/], exclude: /node_modules/, loader: 'babel-loader', query: { presets: ['react', 'es2015', 'stage-2'] }},
      //{ test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(less|css)$/, loader: "style!css!less" }
    ]
  }
}

console.log('output', module.exports.output);

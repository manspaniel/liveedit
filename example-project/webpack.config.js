module.exports = {
  entry: {
    "index.html": "./src/frontend/index.html",
    index: "./src/frontend/index.tsx"
  },
  mode: "development",
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
              "@babel/preset-react"
            ],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.html?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          },
          {
            loader: "extract-loader"
          },
          {
            loader: "html-loader",
            options: {}
          }
        ]
      }
    ]
  }
}

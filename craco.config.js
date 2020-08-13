const path = require("path");
const { getLoader, loaderByName } = require("@craco/craco");

const terriajsStyleLibrary = path.join(
  path.dirname(require.resolve("terriajs/package.json")),
  "lib",
  "Styled"
);

module.exports = {
  webpack: {
    configure: webpackConfig => {
      // parse terriajs styled components so we can use them without updating
      // terriajs to publish proper modules - can likely remove this once
      // we fix that
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName("babel-loader")
      );
      if (isFound) {
        match.loader.include = [
          ...(Array.isArray(match.loader.include)
            ? match.loader.include
            : [match.loader.include]),
          terriajsStyleLibrary
        ];
      }
      return webpackConfig;
    }
  }
};

module.exports = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? "/Sign-Connect" : "",
  turbopack: {
    root: __dirname,
  },
};

module.exports = {
  devServer: {
    port: 3425,
    proxy: {
      '/api': {
        target: 'http://localhost:8425',
        changeOrigin: true
      }
    }
  }
};
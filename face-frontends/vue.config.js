module.exports = {
    // 选项
    publicPath: '/',
    outputDir: 'dist',
    devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                ws: true,
                changeOrigin: true,
                pathRewrite:{
                    '^/api': '/'
                }
            },
        }
    }
}

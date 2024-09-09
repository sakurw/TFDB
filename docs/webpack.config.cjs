const path = require('path');

module.exports = {
    entry: './index.js',  // プロジェクトルートの index.js を使用
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'docs'),
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};
module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        "postcss-replace": {
            pattern: /vhk-theme-dark/gi,
            commentsOnly: false,
            data: {
                replaceAll: 'theme-dark'
            }
        },
    },
}

module.exports = {
    globals: {
        "t": true,
        "n": true,
        "OC": true,
        "OCA": true,
        "Files": true,
        "FileList": true,
        "XMLHttpRequest": true,
        "window": true,
        "navigator": true,
        "document": true,
        "history": true,
    },
    extends: [
        '@nextcloud',
    ],
    rules: {
        "indent": ["error", 4],
        "quotes": "off",
        "quote-props": "off",
        "semi": "off",
        "comma-dangle": "off",
        "no-control-regex": "off",
        "n/no-extraneous-import": "off",
        "jsdoc/require-jsdoc": "off",
        "vue/no-v-html": "off",
    }
}

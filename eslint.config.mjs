import globals from 'globals';

export default [
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**']
    },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                jQuery: 'readonly',
                $: 'readonly'
            }
        },
        rules: {
            'strict': 0,
            'no-underscore-dangle': 0,
            'quotes': [0, 'double', 'avoid-escape'],
            'indent': [2, 4],
            'brace-style': [2, '1tbs'],
            'no-alert': 2,
            'no-var': 2
        }
    }
];

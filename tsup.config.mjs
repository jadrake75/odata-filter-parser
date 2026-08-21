import { defineConfig } from 'tsup';

export default defineConfig([
    {
        entry: {
            'odata-parser': 'src/odata-parser.js'
        },
        outDir: 'dist',
        format: ['cjs'],
        minify: false,
        sourcemap: false,
        clean: true,
        outExtension() {
            return { js: '.js' };
        }
    },
    {
        entry: {
            'odata-parser-min': 'src/odata-parser.js'
        },
        outDir: 'dist',
        format: ['cjs'],
        minify: true,
        sourcemap: false,
        clean: false,
        outExtension() {
            return { js: '.js' };
        }
    }
]);

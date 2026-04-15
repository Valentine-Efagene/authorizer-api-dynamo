import esbuild from 'esbuild';

const commonOptions = {
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    banner: {
        js: 'import { createRequire } from "module"; import { fileURLToPath } from "url"; import { dirname } from "path"; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);',
    },
    external: ['@aws-sdk/*'],
    minify: false,
    sourcemap: true,
};

await esbuild.build({
    ...commonOptions,
    entryPoints: ['src/lambda.ts'],
    outfile: 'dist/lambda.mjs',
});

console.log('Build complete');
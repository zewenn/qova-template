

import * as esbuild from 'esbuild';

const externalPackages = [];
async function main() {
    const currentTime = new Date();
    await esbuild.build({
        entryPoints: ['./source/index.ts'],
        bundle: true,
        platform: 'node',
        external: externalPackages,
        minify: false,
        outfile: './build/main.js',
    });
    console.log(`Source built in \x1b[33m${(new Date()) - currentTime}\x1b[0m ms`);
}

main()
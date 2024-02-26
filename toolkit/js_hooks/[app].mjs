
const externalPackages = [];
async function main() {
    const currentTime = new Date();
    await esbuild.build({
        entryPoints: ['./app/index.ts'],
        bundle: true,
        platform: 'node',
        external: externalPackages,
        minify: true,
        outfile: './build/index.js',
    });
    console.log(`App built in \x1b[33m${(new Date()) - currentTime}\x1b[0m ms`);
}

main()
import {defineConfig} from 'tsup';
import pkg from './package.json';
import {generateBanner} from "@phucbm/banner";

export default defineConfig([
    // ESM build
    {
        entry: ['src/index.ts'],
        outDir: 'dist',
        format: ['esm'],
        target: 'es2020',
        platform: 'node',
        bundle: true,
        minify: true,
        sourcemap: true,
        dts: true,
        clean: true,
        outExtension: () => ({js: '.js'}),
        banner: {js: generateBanner()},
        onSuccess: async () => {
            console.log('✅ ESM build completed');
            console.log(`\n🎉 ${pkg.description} v${pkg.version} - Build completed successfully!\n`);
            console.log(`📦 Generated files:`);
            console.log(`   • dist/index.js`);
            console.log(`   • dist/index.d.ts\n`);
        }
    }
]);

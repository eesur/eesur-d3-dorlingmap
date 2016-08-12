import babel from 'rollup-plugin-babel';

export default {
    entry: 'lib/index.js',
    sourceMap: true,
    format: 'iife',
    moduleName: 'EESUR',
    plugins: [babel()],
    dest: 'dist/thed3-bundle.js'
};
/** Name:   boilerplate.build.js
 *  Desc:   Build the src code from ./src
 *  Author: Jimy Houlbrook
 *  Date:   11/11/24
 */

import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    format: "cjs",
    outfile: './dist/main.js'
});
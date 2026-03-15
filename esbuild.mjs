import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

/** @type {esbuild.BuildOptions} */
const serverOptions = {
  entryPoints: ["packages/server/src/server.ts"],
  bundle: true,
  outfile: "packages/client/out/server.js",
  format: "cjs",
  platform: "node",
  target: "es2020",
  sourcemap: true,
  external: ["vscode"],
};

/** @type {esbuild.BuildOptions} */
const clientOptions = {
  entryPoints: ["packages/client/src/extension.ts"],
  bundle: true,
  outfile: "packages/client/out/extension.js",
  format: "cjs",
  platform: "node",
  target: "es2020",
  sourcemap: true,
  external: ["vscode"],
};

if (isWatch) {
  const [serverCtx, clientCtx] = await Promise.all([
    esbuild.context(serverOptions),
    esbuild.context(clientOptions),
  ]);
  await Promise.all([serverCtx.watch(), clientCtx.watch()]);
  console.log("Watching for changes...");
} else {
  await Promise.all([esbuild.build(serverOptions), esbuild.build(clientOptions)]);
  console.log("Build complete.");
}

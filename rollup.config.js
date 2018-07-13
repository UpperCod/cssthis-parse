export default {
    input: "src/index.js",
    output: [{ file: "dist/index.js", format: "cjs", sourcemap: true }],
    external: ["postcss"]
};

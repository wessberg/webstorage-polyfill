import {minify} from "uglify-js";
import uglify from "rollup-plugin-uglify";
import babel from "rollup-plugin-babel";
import nodeResolve from "rollup-plugin-node-resolve";

const MINIFY = process.env.NODE_ENV === "production";

export default {
	entry: "src/index.js",
	format: "iife",
	moduleName: "localStorage",
	plugins: [
		nodeResolve({
			main: true,
			jsnext: true
		}),
		babel()
	].concat(MINIFY ? [uglify({
		compress: {
			warnings: false,
			dead_code: true,
			unsafe: true,
			drop_console: true,
			unused: true,
			loops: true,
			booleans: true,
			conditionals: true,
			sequences: true,
			properties: true,
			comparisons: true,
			if_return: true,
			join_vars: true,
			cascade: true,
			collapse_vars: true
		},
		screwIE8: false,
		comments: false,
		mangle: true
	}, minify)
	] : [])
}

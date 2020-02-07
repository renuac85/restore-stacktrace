/**
 * Trifacta Inc. Confidential
 *
 * Copyright 2015 Trifacta Inc.
 * All Rights Reserved.
 *
 * Any use of this material is subject to the Trifacta Inc., Source License located
 * in the file 'SOURCE_LICENSE.txt' which is part of this package.  All rights to
 * this material and any derivative works thereof are reserved by Trifacta Inc.
 */

const fs = require('fs');
const program = require('commander');
const readline = require('readline')

const restoreStacktrace = require('./restore-stacktrace');
const {SourceMapFetcher} = require("./load-sourcemaps")

program
	.version('0.0.1')
	.option('-b --base <value>', 'Base URL for fetching source maps')
	.option('-s, --stacktrace <value>', 'File containing minified stack trace')
	.option('-i, --interactive', 'Read stack trace from stdin until the empty line')
	.parse(process.argv);

(async function () {
	const fetcher = new SourceMapFetcher(program.base)

	let stacktrace
	if (program.interactive) {
		console.log("Interactive, reading stacktrace from STDIN")
		stacktrace = await new Promise((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			})
			let traceContent = ''
			rl.on('line', (input) => {
				if (input === '') {
					rl.close()
					resolve(traceContent)
				} else {
					traceContent += input
					traceContent += "\n"
				}
			})
		})
	} else if (program.stacktrace) {
		stacktrace = fs.readFileSync(program.stacktrace).toString()
	} else {
		console.error("Neither -i nor -s specified, aborting")
		program.help()
		process.exit(1)
		return
	}
	console.log("restoring stacktrace...")
	console.log(await restoreStacktrace({
		stacktrace,
		fetcher,
	}));
})()


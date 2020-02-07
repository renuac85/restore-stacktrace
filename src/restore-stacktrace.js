/**
 * Trifacta Inc. Confidential
 *
 * Copyright 2015 Trifacta Inc.
 * All Rights Reserved.
 *
 * Any use of this material is subject to the Trifacta Inc., Source License located
 * in the file 'SOURCE_LICENSE.txt' which is part of this package.  All rights to
 * this material and any derivative works thereof are reserved by Trifacta Inc.
 *
 * Modified by charlag
 */

async function restoreStacktrace(options) {
	const {stacktrace, fetcher} = options

	const lines = stacktrace.split('\n');
	let result = '';

	for (let stackLine of lines) {
		stackLine = stackLine.trim();

		if (isAtWordLine(stackLine)) {
			const parsed = parseAtWordLine(stackLine)
			result += await outputLine(fetcher, stackLine, parsed)
		} else if (isAtSymbolLine(stackLine)) {
			const parsed = parseAtSymbolLine(stackLine)
			result += await outputLine(fetcher, stackLine, parsed)
		} else {
			result += stackLine;
		}

		result += '\n';
	}

	return result;
}

function isAtWordLine(line) {
	return line.startsWith("at ")
}

function isAtSymbolLine(line) {
	return line.includes("@")
}

function parseAtWordLine(stackLine) {
	// isUrlOnly
	// true: " at http://something/bundle.js:1:1"
	// false: " at bla.bla (http://something/bundle.js:1:1)"
	const isUrlOnly = stackLine.match(/^at (http|https|file):\/\//);

	let sourceUrl = isUrlOnly
		? stackLine.substring('at '.length)
		: stackLine.substring(
			stackLine.lastIndexOf('(') + 1,
			stackLine.lastIndexOf(')')
		);
	let compiledName = isUrlOnly
		? null
		: stackLine.substring('at '.length, stackLine.lastIndexOf('('))


	const bundleFile = sourceUrl.substring(
		sourceUrl.lastIndexOf('/') + 1,
		sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1)
	);

	const sourceLine = parseInt(sourceUrl.substring(
		sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1) + 1,
		sourceUrl.lastIndexOf(':')
	));

	const sourceColumn = parseInt(sourceUrl.substring(
		sourceUrl.lastIndexOf(':') + 1,
		sourceUrl.length
	));

	return {
		sourceLine,
		sourceColumn,
		bundleFile,
		compiledName,
	}
}

function parseAtSymbolLine(line) {
	const [compiledName, rest] = line.split("@")
	const lineColRegex = /(.*):([0-9]+):([0-9]+)/
	const lineRegex = /(.*):([0-9]+)/
	let sourceUrl, sourceLine, sourceColumn
	if (lineColRegex.test(rest)) {
		const regexArray = lineColRegex.exec(rest)
		sourceUrl = regexArray[1]
		sourceLine = parseInt(regexArray[2])
		sourceColumn = parseInt(regexArray[3])
	} else if (lineRegex.test(rest)) {
		const regexArray = lineRegex.exec(rest)
		sourceUrl = regexArray[1]
		sourceLine = parseInt(regexArray[2])
	}
	const bundleFile = sourceUrl.substring(
		sourceUrl.lastIndexOf('/') + 1
	);
	return {
		sourceLine,
		sourceColumn,
		bundleFile,
		compiledName
	}
}

async function outputLine(fetcher, stackLine, {
	sourceLine,
	sourceColumn,
	bundleFile,
	compiledName
}) {
	let result = ""
	const sourceMap = await fetcher.getMap(bundleFile);

	if (sourceMap == null) {
		return '  [original] ' + stackLine
	}
	const originalPosition = sourceMap.originalPositionFor({
		line: sourceLine,
		column: sourceColumn
	});

	let source = originalPosition.source.startsWith("webpack:///")
		? originalPosition.source.substring('webpack:///'.length, originalPosition.source.length)
		: originalPosition.source

	// remove last ? part
	if (source.lastIndexOf('?') > source.lastIndexOf('/')) {
		source = source.substring(0, source.lastIndexOf('?'));
	}

	result += '  at ';
	if (compiledName) {
		// Output compiled location too
		result += compiledName + " "
	}
	if (originalPosition.name) {
		result += originalPosition.name
	}
	result += ' (' + source + ':' + originalPosition.line + ':' + originalPosition.column + ')';
	return result
}

module.exports = restoreStacktrace;

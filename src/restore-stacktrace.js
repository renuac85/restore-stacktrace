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

		if (stackLine.indexOf('at ') === 0) {
			// isUrlOnly
			// true: " at http://something/bundle.js:1:1"
			// false: " at bla.bla (http://something/bundle.js:1:1)"
			const isUrlOnly = stackLine.match(/^at (http|https|file):\/\//);

			let sourceUrl = isUrlOnly ?
				stackLine.substring('at '.length) :
				stackLine.substring(
					stackLine.lastIndexOf('(') + 1,
					stackLine.lastIndexOf(')')
				);

			const bundleFile = sourceUrl.substring(
				sourceUrl.lastIndexOf('/') + 1,
				sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1)
			);

			const sourceLine = parseInt(sourceUrl.substring(
				sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1) + 1,
				sourceUrl.lastIndexOf(':')
			));

			const column = parseInt(sourceUrl.substring(
				sourceUrl.lastIndexOf(':') + 1,
				sourceUrl.length
			));

			const sourceMap = await fetcher.getMap(bundleFile);

			if (sourceMap == null) {
				result += '  [original] ' + stackLine;
				result += '\n';

				continue
			}

			const originalPosition = sourceMap.originalPositionFor({
				line: sourceLine,
				column: column
			});

			let source = originalPosition.source.startsWith("webpack:///")
				? originalPosition.source.substring('webpack:///'.length, originalPosition.source.length)
				: originalPosition.source

			// remove last ? part
			if (source.lastIndexOf('?') > source.lastIndexOf('/')) {
				source = source.substring(0, source.lastIndexOf('?'));
			}

			result += '  at ';
			if (!isUrlOnly) {
				result += stackLine.substring('at '.length, stackLine.lastIndexOf('('));
			}
			result += originalPosition.name;
			result += ' (' + source + ':' + originalPosition.line + ':' + originalPosition.column + ')';
		} else {
			result += stackLine;
		}

		result += '\n';
	}

	return result;
}

module.exports = restoreStacktrace;

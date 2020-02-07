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
const {SourceMapConsumer} = require('source-map');

module.exports = function (sourceMapsDirectory) {
	return fs.readdirSync(sourceMapsDirectory).reduce(function (files, filename) {

		if (!filename.endsWith(".map")) {
			return files;
		}

		const moduleName = filename.substring(0, filename.length - '.map'.length);
		const sourceMapFile = sourceMapsDirectory + filename;
		const sourceMapContent = fs.readFileSync(sourceMapFile).toString();

		files[moduleName] = new SourceMapConsumer(sourceMapContent);

		return files;
	}, {});
};

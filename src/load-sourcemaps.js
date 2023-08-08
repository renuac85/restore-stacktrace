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

const {SourceMapConsumer} = require('source-map');
const fetch = require("node-fetch")

module.exports.SourceMapFetcher = class SourceMapFetcher {
	constructor(baseUrl) {
		this.map = {}
		const normalizedBase = baseUrl.endsWith("/") ? baseUrl : (baseUrl + "/")
		this.baseUrl = normalizedBase
	}

	async getMap(filename) {
		if (this.map[filename]) {
			return this.map[filename]
		}
		try {
			const response = await fetch(this.baseUrl + filename + ".map")
			const content = await response.text()
			this.map[filename] = await new SourceMapConsumer(content)
			return this.map[filename]
		} catch (e) {
			console.warn(e)
			return null
		}
	}
}


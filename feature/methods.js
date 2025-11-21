"use strict";
// Copyright ©2000-2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:64117952128852072441 LICENSE.md

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

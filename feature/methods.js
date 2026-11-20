"use strict";
// Error Deva Feature Methods
// Copyright ©2000-2026 Quinn Arjuna Michaels; All rights reserved. 
// Owner Signature Required For Lawful Use.
// Distributed under VLA:59024890266819710612 LICENSE.md
// Thursday, November 19, 2026 - 5:57:23 PM PST

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

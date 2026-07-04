"use strict";
// Error Deva Feature Methods
// Copyright ©2000-2026 Quinn Arjuna Michaels; All rights reserved. 
// Owner Signature Required For Lawful Use.
// Distributed under VLA:57975820709417676694 LICENSE.md
// Friday, July 3, 2026 - 8:08:06 PM PST

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

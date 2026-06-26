"use strict";
// Error Deva Feature Methods
// Copyright ©2000-2026 Quinn America Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:42080562252372472926 LICENSE.md
// Thursday, June 25, 2026 - 4:01:46 PM PST

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

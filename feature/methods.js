"use strict";
// Error Deva Feature Methods
// Copyright ©2000-2026 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:64819928900499225876 LICENSE.md
// Sunday, January 4, 2026 - 9:04:53 AM

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

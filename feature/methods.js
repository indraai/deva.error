// ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under the Vedic License Agreement LICENSE.md

export default {
	async error(packet) {
		const error = await this.methods.sign('error', 'default', packet);
		return error;
	}
};

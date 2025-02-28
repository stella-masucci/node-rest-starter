import express from 'express';
import { Validator } from 'express-json-validator-middleware';

import user from '../user/user.controller';
import * as exportConfig from './export-config.controller';
import { exportConfigSchema } from './export-config.schemas';

const { validate } = new Validator({});

const router = express.Router();

// Admin post CSV config parameters
router
	.route('/requestExport')
	.post(
		user.hasAccess,
		validate({ body: exportConfigSchema }),
		exportConfig.requestExport
	);

export = router;

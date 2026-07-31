const router = require('express').Router();
const ctrl = require('../controllers/aiController');
const validate = require('../middlewares/validate');
const { aiClassifySchema } = require('../validators/schemas');

router.post('/classify', validate(aiClassifySchema), ctrl.classify);

module.exports = router;

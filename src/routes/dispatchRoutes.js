const router = require('express').Router();
const ctrl = require('../controllers/dispatchController');
const validate = require('../middlewares/validate');
const { dispatchNotifySchema } = require('../validators/schemas');

router.post('/notify', validate(dispatchNotifySchema), ctrl.notifyDispatch);

module.exports = router;

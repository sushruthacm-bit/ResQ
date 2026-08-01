const router = require('express').Router();
const ctrl = require('../controllers/responderController');
const validate = require('../middlewares/validate');
const { assignResponderSchema } = require('../validators/schemas');

router.get('/', ctrl.getAllResponders);
router.post('/assign', validate(assignResponderSchema), ctrl.assignResponder);
router.post('/auto-assign', ctrl.autoAssignResponder);
module.exports = router;

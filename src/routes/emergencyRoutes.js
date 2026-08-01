const router = require('express').Router();
const ctrl = require('../controllers/emergencyController');
const validate = require('../middlewares/validate');
const { createEmergencySchema, updateStatusSchema } = require('../validators/schemas');

router.post('/', validate(createEmergencySchema), ctrl.createEmergency);
router.get('/pending', ctrl.getPendingEmergencies);
router.get('/active', ctrl.getActiveEmergencies);
router.patch('/:id/status', validate(updateStatusSchema), ctrl.updateStatus);
router.get('/:id/timeline', ctrl.getTimeline);
module.exports = router;

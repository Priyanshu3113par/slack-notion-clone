"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const channelController_1 = require("../controllers/channelController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, channelController_1.createChannel);
router.get('/workspace/:workspaceId', auth_1.authenticate, channelController_1.getChannels);
router.get('/:id', auth_1.authenticate, channelController_1.getChannel);
router.put('/:id', auth_1.authenticate, channelController_1.updateChannel);
router.delete('/:id', auth_1.authenticate, channelController_1.deleteChannel);
exports.default = router;
//# sourceMappingURL=channelRoutes.js.map
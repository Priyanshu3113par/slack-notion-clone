"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, messageController_1.getMessages);
router.get('/channel/:channelId', auth_1.authenticate, messageController_1.getMessages);
router.post('/', auth_1.authenticate, messageController_1.createMessage);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map
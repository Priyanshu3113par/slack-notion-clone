"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/refresh', authController_1.refreshSession);
router.get('/profile', auth_1.authenticate, authController_1.profile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map
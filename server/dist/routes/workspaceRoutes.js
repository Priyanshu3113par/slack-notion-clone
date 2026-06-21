"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const workspaceController_1 = require("../controllers/workspaceController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, workspaceController_1.createWorkspace);
router.get('/', auth_1.authenticate, workspaceController_1.getWorkspaces);
router.get('/:id', auth_1.authenticate, workspaceController_1.getWorkspace);
router.put('/:id', auth_1.authenticate, workspaceController_1.updateWorkspace);
router.delete('/:id', auth_1.authenticate, workspaceController_1.deleteWorkspace);
router.post('/join', auth_1.authenticate, workspaceController_1.joinWorkspace);
router.post('/:id/leave', auth_1.authenticate, workspaceController_1.leaveWorkspace);
exports.default = router;
//# sourceMappingURL=workspaceRoutes.js.map
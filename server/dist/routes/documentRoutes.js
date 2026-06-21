"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const documentController_1 = require("../controllers/documentController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, documentController_1.createDocument);
router.get('/workspace/:workspaceId', auth_1.authenticate, documentController_1.getDocuments);
router.get('/:id', auth_1.authenticate, documentController_1.getDocument);
router.put('/:id', auth_1.authenticate, documentController_1.updateDocument);
router.delete('/:id', auth_1.authenticate, documentController_1.deleteDocument);
exports.default = router;
//# sourceMappingURL=documentRoutes.js.map
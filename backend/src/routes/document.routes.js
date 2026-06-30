import express from "express";

import auth from "../middleware/auth.js";

import {

createDocument,

getDocuments,

getDocument,

updateDocument,

deleteDocument,

getMembers

} from "../controllers/document.controller.js";

const router = express.Router();

router.use(auth);

router.post("/", createDocument);

router.get("/", getDocuments);

router.get("/:id", getDocument);

router.put("/:id", updateDocument);
router.patch("/:id", updateDocument);

router.delete("/:id", deleteDocument);

router.get("/:id/members", getMembers);

export default router;
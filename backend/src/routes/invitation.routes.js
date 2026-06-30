import express from "express";
import auth from "../middleware/auth.js";
import {
    inviteUser,
    acceptInvitation
} from "../controllers/invitation.controller.js";

const router = express.Router();

router.use(auth);

router.post("/", inviteUser);

router.post("/:id/accept", acceptInvitation);

export default router;
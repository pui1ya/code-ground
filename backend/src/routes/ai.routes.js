import express from "express";
import auth from "../middleware/auth.js";
import { query } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/ask", auth, query);

export default router;
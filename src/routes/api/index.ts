import { Router } from "express";
import authRouter from "./auth.routes";
import secretaryRouter from "./secretary.routes"
const router = Router();

router.use("/auth", authRouter);
router.use("/secretary", secretaryRouter);

export default router;

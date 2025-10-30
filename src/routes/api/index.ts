import { Router } from "express";
import authRouter from "./auth.routes";
import secretaryRouter from "./secretary.routes"
import studentRouter from "./student.routes"
import teacherRouter from "./teacher.routes"


const router = Router();

router.use("/auth", authRouter);
router.use("/secretary", secretaryRouter);
router.use("/student", studentRouter);
router.use("/teacher", teacherRouter);


export default router;

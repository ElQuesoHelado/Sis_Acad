import { Router } from "express";
import { SecretaryController } from "../../controller/secretaryController";

const router = Router();
const secretaryController = new SecretaryController();

router.post("/students", secretaryController.viewAllStudents);

export default router;

import { Router } from 'express';
import { StudentController } from '../../controller/studentController';

const router = Router();
const studentController = new StudentController();

router.get('/:cui/schedule', studentController.getStudentSchedule);
router.get('/:cui/courses', studentController.getStudentCourses);

export default router;

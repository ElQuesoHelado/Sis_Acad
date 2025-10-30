import { Router } from 'express';
import { TeacherController } from '../../controller/teacherController';

const router = Router();
const teacherController = new TeacherController();

router.get('/:teacherId/schedule', teacherController.getTeacherSchedule);
router.get('/:teacherId/courses', teacherController.getTeacherCourses);

export default router;

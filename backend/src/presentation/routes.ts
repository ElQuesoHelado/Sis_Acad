import express from "express";
import { createStudentRouter } from "./routes/student.routes.js";
import { container } from "src/container.js";
import { createTeacherRouter } from "./routes/teacher.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createUserRouter } from "./routes/user.routes.js";
import { createClassroomRouter } from "./routes/classroom.routes.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createSecretaryRouter } from "./routes/secretary.routes.js";

const apiRouter = express.Router();

// Create routers by injecting the dependency container
const studentRouter = createStudentRouter(container);
const teacherRouter = createTeacherRouter(container);
const authRouter = createAuthRouter(container);
const userRouter = createUserRouter(container);
const classroomRouter = createClassroomRouter(container);
const adminRouter = createAdminRouter(container);
const secretaryRouter = createSecretaryRouter(container);

// Register routers
apiRouter.use("/student", studentRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/teacher", teacherRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/classrooms", classroomRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/secretary", secretaryRouter);

export default apiRouter;

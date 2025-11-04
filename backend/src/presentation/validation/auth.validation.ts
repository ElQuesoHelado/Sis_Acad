import { z } from "zod";
import { validate } from "../middlewares/validation.middleware.js";

const loginBodySchema = z.object({
  email: z.email("Invalid email format."),
  password: z.string().min(10, "Password is too short."),
});

export const validateLogin = validate(z.object({ body: loginBodySchema }));

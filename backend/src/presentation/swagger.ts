import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Express + TS",
      version: "1.0.0",
    },
  },
  apis: [join(__dirname, "./routes/*.ts")],
});

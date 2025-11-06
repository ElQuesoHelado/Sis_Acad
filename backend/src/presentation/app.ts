/**
 * @file Main Express application setup.
 * Responsible for configuring middlewares, authentication, and routes.
 */
import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino-http";
import { expressjwt } from "express-jwt";
import { env } from "@/infraestructure/config/index.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import swaggerDocument from "../../docs/swagger.json" with { type: "json" };
import swaggerUi from "swagger-ui-express";

export class App {
  public readonly app: Application;

  constructor() {
    this.app = express();
    this.configureMiddlewares();
    // Authentication and routes will be configured later in index.ts
  }

  /**
   * Configures core middlewares: logging, security, and body parsing.
   */
  private configureMiddlewares(): void {
    this.app.use(cors()); // Enable CORS
    this.app.use(helmet()); // Secure HTTP headers
    this.app.use(express.json()); // Parse JSON bodies
    this.app.use(pino.default()); // HTTP request logger
  }

  /**
   * Configures JWT authentication middleware.
   * Protects all routes registered *after* this middleware is applied.
   */
  public configureAuth(): void {
    this.app.use(
      expressjwt({
        secret: env.JWT_SECRET, // Secret key from environment variables
        algorithms: ["HS256"], // Token signing algorithm
      }).unless({
        // Define public routes that do NOT require authentication
        path: [
          "/api/health", // Public health check
          "/api/auth/login", // Public login route
          { url: /^\/api-docs\/?.*/, methods: ["GET"] },
        ],
      }),
    );
  }

  /**
   * Registers API routes and attaches the global error handler.
   * @param apiRouter - The main router containing all API endpoints.
   */
  public registerRoutes(apiRouter: express.Router): void {
    // Register main API routes
    this.app.use("/api", apiRouter);
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );

    // Public health check endpoint
    this.app.get("/api/health", (_req, res) => {
      res.status(200).json({ status: "OK", time: new Date().toISOString() });
    });

    // The global error handler must be registered LAST,
    // after all other app.use() and route declarations.
    this.app.use(globalErrorHandler);
  }

  /**
   * Starts the Express server on the configured port.
   */
  public listen(): void {
    const PORT = env.PORT || 5000;
    this.app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

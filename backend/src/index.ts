/**
 * @file Application entry point (Composition Root).
 */
import "reflect-metadata";
import { AppDataSource } from "@/infraestructure/persistence/database.config.js";
import { App } from "@/presentation/app.js";
import apiRouter from "./presentation/routes.js";
import express from "express";
/**
 * Main application bootstrap function.
 * Initializes the database, sets up routes, and starts the server.
 */
async function bootstrap() {
  const app = new App();

  // Initialize Database
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully.");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  const router = express.Router();
  router.use(apiRouter);

  app.configureAuth(); // Setup JWT authentication
  app.registerRoutes(router);

  app.listen();
}

// Run the application
await bootstrap();

import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas básicas
app.get("/", (req, res) => {
  res.json({ message: "Servidor con TypeScript + Express + TypeORM + SQLite" });
});

// Ruta para crear usuario
app.post("/users", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = userRepository.create(req.body);
    const results = await userRepository.save(user);
    return res.status(201).json(results);
  } catch (error) {
    return res.status(500).json({ error: "Error creating user" });
  }
});

// Ruta para obtener usuarios
app.get("/users", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching users" });
  }
});

// Inicializar base de datos y servidor
AppDataSource.initialize()
  .then(() => {
    console.log(" Database connected");

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(" Database connection error:", error);
  });

import "reflect-metadata";
import express from "express";
import path from "path";
import { AppDataSource } from "./data-source";
import apiRouter from "./routes/api";

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.render('index', {
    title: "Home",
    message: "String desde server"
  });
});

app.use("/api/v1", apiRouter);

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

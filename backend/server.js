import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/film", (req, res) => {
  res.json([{ id: 1, titolo: "Matrix" }, { id: 2, titolo: "Inception" }]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));


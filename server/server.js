import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.js";
import statsRoutes from "./routes/stats.js";
import responsesRoutes from "./routes/responses.js";

const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.static("client"));
app.use(cors());

app.use("/api", chatRoutes);
app.use("/api", statsRoutes);
app.use("/api", responsesRoutes);

app.listen(PORT, () => console.log("Server running at " + PORT));
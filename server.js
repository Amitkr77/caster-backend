
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { aiexpertContactRoute } from "./aiexperts/aiexperts.routes.js";
import { castorGlobalsContactRoute } from "./castorglobals/castorglobal.routes.js";
import { bharatXVenturesContactRoute } from "./bharatxventures/bharatxventures.routes.js";
import { bharatXInfratechContactRoute } from "./bharatxinfratech/bharatxinfratech.routes.js";


const app = express();

// Allow all origins
app.use(cors({
  origin: "*",
}));
app.set("trust proxy", 1);
app.use(express.json());

app.use("/api/castorglobals/contact", castorGlobalsContactRoute);
app.use("/api/aiexperts/contact", aiexpertContactRoute);
app.use("/api/bharatxventures/contact", bharatXVenturesContactRoute);
app.use("/api/bharatxinfratech/contact", bharatXInfratechContactRoute);


const res = await fetch("https://api.ipify.org?format=json");
const data = await res.json();
console.log("Server public IP:", data.ip);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "Server is running",
    timestamp: new Date(),
  });
})
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "Healthy",
    timestamp: new Date(),
  });
});

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);


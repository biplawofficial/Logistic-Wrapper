import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";

import { config } from "./utils/envConfig";
import { dbConnect } from "./db/dbConnect";
import routerv1 from "./routes/connector";
import { registerDriverLocationSocket } from "./sockets/socket";

const app = express();
const PORT = config.PORT;

dbConnect();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/v1", routerv1);

app.get("/", (req, res) => {
  res.send("Health Check Passed");
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

registerDriverLocationSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

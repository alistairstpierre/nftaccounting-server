import * as dotenv from "dotenv";
import cors from "cors";
import express, { query, Request, Response } from "express";
import Broker from "./services/rabbitMQ";
import publishToExchange from "./services/queueWorkers/producer";
import web3 from "web3";

// const prisma = new PrismaClient();
const app = express();
const RMQProducer = new Broker().init();

// Constants
const PORT = 8080;

// TODO might need body-parser
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(async (req: any, res, next) => {
  try {
    req.RMQProducer = await RMQProducer;
    next();
  } catch (error) {
    console.error("error with Broker on app.use()", error);
    process.exit(1);
  }
});

// 🏚️ Default Route
// This is the Default Route of the API
app.get("/data", async (req: any, res: Response) => {
  let address = null;
  try {
    address = web3.utils.toChecksumAddress(req.query.wallet);
  } catch (error) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }
  try {
    if(address){
      await publishToExchange(req.RMQProducer, {
        message: JSON.stringify({ wallet: address }),
        routingKey: "wallet-history",
      });
      res.status(200).send({ status: "success" });
    }
  } catch (error) {
    res.status(400).send({ status: "failed" });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Running on port 8080`);
});

process.on("SIGINT", async () => {
  process.exit(1);
});

process.on("exit", (code) => async () => {
  (await RMQProducer).channel.close();
  (await RMQProducer).connection.close();
});

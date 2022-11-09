import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import cors from "cors";
import express, { Request, Response } from "express";
import { MoralisItem, Transaction } from "./interfaces";
import { get_covalent_data } from "./util/fetching/covalent";
import { get_moralis_data } from "./util/fetching/moralis";
import { moralis_parse } from "./util/parsing/moralis/moralisparser";
import { trades_parse } from "./util/parsing/trades";
import { get_image_urls } from "./util/fetching/alchemy";
// const prisma = new PrismaClient();
const app = express();

// Constants
const PORT = 8080;

// TODO might need body-parser
dotenv.config();
app.use(express.json());
app.use(cors());

// 🏚️ Default Route
// This is the Default Route of the API
app.get("/", async (req: Request, res: Response) => {
  global.is_fetching_covalent = false;
  global.is_fetching_moralis = false;
  global.is_fetching_opensea = false;
  global.is_parsing_covalent = false;
  global.alchemy_call_amount = 0;
  global.walletAddress = "0x73CD457e12f5fa160261FEf96C63CA4cA0478b2F".toLowerCase();
  const startTime = performance.now();
  const added: any = await Promise.all([get_covalent_data(), get_moralis_data()]);
  const endTime = performance.now();
  console.log(`Fetching took ${endTime - startTime} milliseconds`);
  const covalent: Transaction[] = [];
  const moralis: MoralisItem[] = [];
  let covalentTradeCount = 0;
  let moralisTxCount = 0;
  added[0].forEach((item: any) => {
    item.forEach((element: any) => {
      element.forEach((obj: any) => {
        covalent.push(obj);
      });
    });
  });
  added[1].forEach((item: any) => {
    item.result.forEach((element: any) => {
      moralis.push(element);
    });
  });
  const preParse = moralis_parse(moralis, covalent);
  const trades = trades_parse(preParse).trades;
  const tradesWithUrls = await get_image_urls(trades);
  res.json(tradesWithUrls);
});

// Create new user
// This is the Route for creating a new user via POST Method
// app.post("/users", async (req: Request, res: Response) => {
//   //get name and email from the request body
//   const { name, email } = req.body;
//   const user = await prisma.user.create({
//     data: {
//       name: String(name),
//       email: String(email),
//       status: "active",
//     },
//   });
//   res.json({ message: "success", data: user });
// });

// // Get single user
// // This is the Route for getting a single user via GET Method
// app.get("/users/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const user = await prisma.user.findUnique({
//     where: {
//       id: Number(id),
//     },
//   });
//   res.json({ message: "success", data: user });
// });

// // Get all users
// // This is the Route for getting all users via GET Method
// app.get("/users", async (req: Request, res: Response) => {
//   const users = await prisma.user.findMany();
//   res.json({ message: "success", data: users });
// });

// // Update user with id
// // This is the Route for updating a user via Patch Method
// app.patch("/users/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { name, email } = req.body;
//   const user = await prisma.user.update({
//     where: {
//       id: Number(id),
//     },
//     data: {
//       name: String(name),
//       email: String(email),
//     },
//   });
//   res.json({ message: "success", data: user });
// });

// // Delete user with id
// // This is the Route for deleting a user via DELETE Method
// app.delete("/users/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const user = await prisma.user.delete({
//     where: {
//       id: Number(id),
//     },
//   });
//   res.json({ message: "success" });
// });

app.listen(PORT, () => {
  console.log(`Running on port 8080`);
});

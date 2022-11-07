import { PrismaClient } from "@prisma/client";
import * as dotenv from 'dotenv';
import express, { Request, Response } from "express";
import { MoralisItem, Transaction } from "./interfaces";
import { get_covalent_data } from "./util/fetching/covalent";
import { get_moralis_data } from "./util/fetching/moralis";
import { moralis_parse } from "./util/parsing/moralis/moralisparser";
// const prisma = new PrismaClient();
const app = express();

// TODO might need body-parser
dotenv.config();
app.use(express.json());

// 🏚️ Default Route
// This is the Default Route of the API
app.get("/", async (req: Request, res: Response) => {
  res.json({ message: "Hello from Express Prisma Boilerplate!" });
  global.walletAddress = "0x73CD457e12f5fa160261FEf96C63CA4cA0478b2F";
  const added:any = await Promise.all([get_covalent_data(), get_moralis_data()])
  const covalent:Transaction[] = [];
  const moralis:MoralisItem[] = [];
  added[0].forEach((item:Transaction) => {
    covalent.push(item);
  });
  moralis_parse(moralis, covalent);
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

app.listen(3000, () => {
  console.log("Express server is running on port 3000");
});

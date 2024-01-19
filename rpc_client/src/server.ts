import express from "express";
import { Request, Response } from "express";
import RabbitMQClient from "./rabbitMQ/client";
import axios from "axios";

const server = express();
const port = 3000;
server.use(express.json()); // you need the body parser middleware

server.post("/operate", async (req, res, next) => {
  console.log(req.body);
  const reqType: string = req.method;
  const response = await RabbitMQClient.produce(req.body, reqType);
  res.send({ response });
});

// server.post("/submissions", async (req: Request, res: Response, next) => {
//   console.log(req.body);
//   const response = await RabbitMQClient.produce(req.body);
//   res.send({ response });
// });

server.get("/getsubmissions", async (req: Request, res: Response) => {
  try {
    const reqType: string = req.method;
    // console.log(reqType);
    // const token = req.body.token as string;
    // const result = await axios.get(
    //   `http://localhost:2358/submissions/${token}`
    // );
    // res.json(result.data.stdout as string);
    const response = await RabbitMQClient.produce(req.body, reqType);
    res.send({ response, reqType });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

type SubmissionData = {
  source_code: string;
  language_id: number;
};

server.post("/submissions", async (req: Request, res: Response) => {
  try {
    const data: SubmissionData = req.body;
    const reqType: string = req.method;
    const response: any = await RabbitMQClient.produce(data, reqType);
    const result = await axios.post(`http://localhost:2358/submissions`, {
      source_code: data.source_code,
      language_id: data.language_id,
    });
    console.log(response);
    res.json(response.data.token as string);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

server.listen(port, async () => {
  console.log(`Server running... ON PORT :${port}`);
  RabbitMQClient.initialize();
});

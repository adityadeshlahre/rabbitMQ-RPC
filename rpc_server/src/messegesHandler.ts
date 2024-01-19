import rabbitClient from "./rabbitMQ/client";
import axios from "axios";

export default class MessageHandler {
  static async handle(
    operation: string,
    data: any,
    correlationId: string,
    replyTo: string,
    reqType: string
  ) {
    let response = {};
    const submissionId = "";

    if (reqType === "POST") {
      try {
        const judge0Response = await axios.post(
          "http://localhost:2357/submissions",
          {
            source_code: data.code,
            language_id: data.language_id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        response = {
          submissionId: judge0Response.data.id,
          status: "Code submitted successfully",
        };
      } catch (error) {
        console.error("Error submitting code:", error);
        response = { error: "Error submitting code" };
      }
    } else if (reqType === "GET") {
      try {
        const judge0Result = await axios.get(
          `http://localhost:2357/submissions/${submissionId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        response = {
          result: judge0Result.data.status.description,
          output: judge0Result.data.stdout,
          status: "Code evaluation successful",
        };
      } catch (error) {
        console.error("Error retrieving code evaluation result:", error);
        response = { error: "Error retrieving code evaluation result" };
      }
    } else if (reqType === "DELETE") {
      try {
        const judge0Result = await axios.delete(
          `http://localhost:2357/submissions/${submissionId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        response = {
          result: judge0Result.data.status.description,
          output: judge0Result.data.stdout,
          status: "Code evaluation successful",
        };
      } catch (error) {
        console.error("Error retrieving code evaluation result:", error);
        response = { error: "Error retrieving code evaluation result" };
      }
    }
    await rabbitClient.produce(response, correlationId, replyTo, reqType);
  }
}

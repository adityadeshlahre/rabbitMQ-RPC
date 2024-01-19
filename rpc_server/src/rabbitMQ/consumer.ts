import { Channel, ConsumeMessage } from "amqplib";
import MessageHandler from "../messegesHandler";
import Producer from "./producer";

export default class Consumer {
  constructor(private channel: Channel, private rpcQueue: string) {}

  async consumeMessages() {
    console.log("Ready to consume messages...");

    this.channel.consume(
      this.rpcQueue,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      async (message: ConsumeMessage) => {
        const { correlationId, replyTo } = message.properties;
        const operation = message.properties.headers.function;
        const reqType = message.properties.headers.argument;
        if (!correlationId || !replyTo || !reqType) {
          console.log("Missing some properties...");
        } else {
          console.log("Consumed", JSON.parse(message.content.toString()));
          await MessageHandler.handle(
            operation,
            JSON.parse(message.content.toString()),
            correlationId,
            replyTo,
            reqType
          );
        }
      },
      {
        noAck: true,
      }
    );
  }
}

//implelentTry catch block

import { Channel } from "amqplib";
import config from "../config";
import { randomUUID } from "crypto";
import EventEmitter from "events";

export default class Producer {
  constructor(
    private channel: Channel,
    private replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async produceMessages(data: any, reqType: string) {
    const uuid = randomUUID();
    console.log("the corr id is ", uuid);
    this.channel.sendToQueue(
      config.rabbitMQ.queues.rpcQueue,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId: uuid,
        expiration: 10,
        headers: {
          function: data.operation,
          // argument: reqType,
        },
      }
    );

    return new Promise((resolve, reject) => {
      this.eventEmitter.once(uuid, async (data) => {
        const reply = JSON.parse(data.content.toString());
        if (reply && reply.data) {
          resolve(reply);
        } else {
          reject("Invalid or empty reply data");
        }
      });
    });
  }
}

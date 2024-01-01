import { Channel, ConsumeMessage } from "amqplib";
import EventEmitter from "events";

export default class Consumer {
  constructor(
    private channel: Channel,
    private replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async consumeMessages() {
    console.log("Ready to consume messages...");

    this.channel.consume(
      this.replyQueueName,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (message: ConsumeMessage) => {
        console.log("the reply is..", JSON.parse(message.content.toString()));
        this.eventEmitter.emit(
          message.properties.correlationId.toString(),
          message
        );
      },
      {
        noAck: true,
      }
    );
  }
}

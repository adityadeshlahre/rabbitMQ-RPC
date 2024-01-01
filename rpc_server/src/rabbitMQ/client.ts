import { Channel, Connection, connect } from "amqplib";
import config from "../config";
import Consumer from "./consumer";
import Producer from "./producer";

class RabbitMQClient {
  private constructor() {}

  private static instance: RabbitMQClient;
  private isInitialized = false;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private producer: Producer;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private consumer: Consumer;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private connection: Connection;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private producerChannel: Channel;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private consumerChannel: Channel;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient();
    }
    return this.instance;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      this.connection = await connect(config.rabbitMQ.url);

      this.producerChannel = await this.connection.createChannel();
      this.consumerChannel = await this.connection.createChannel();

      const { queue: rpcQueue } = await this.consumerChannel.assertQueue(
        config.rabbitMQ.queues.rpcQueue,
        { exclusive: true }
      );

      this.producer = new Producer(this.producerChannel);
      this.consumer = new Consumer(this.consumerChannel, rpcQueue);

      this.consumer.consumeMessages();

      this.isInitialized = true;
    } catch (error) {
      console.log("rabbitmq error...", error);
    }
  }
  async produce(data: any, correlationId: string, replyToQueue: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.producer.produceMessages(
      data,
      correlationId,
      replyToQueue
    );
  }
}

export default RabbitMQClient.getInstance();

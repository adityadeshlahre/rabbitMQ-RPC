import { Channel, Connection, connect } from "amqplib";
import config from "../config";
import Consumer from "./consumer";
import Producer from "./producer";
import { EventEmitter } from "events";

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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private eventEmitter: EventEmitter;

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

      const { queue: replyQueueName } = await this.consumerChannel.assertQueue(
        "",
        { exclusive: true }
      ); //q.queue is the propey which is going to take default names

      this.eventEmitter = new EventEmitter();
      this.producer = new Producer(
        this.producerChannel,
        replyQueueName,
        this.eventEmitter
      );
      this.consumer = new Consumer(
        this.consumerChannel,
        replyQueueName,
        this.eventEmitter
      );

      this.consumer.consumeMessages();

      this.isInitialized = true;
    } catch (error) {
      console.log("rabbitmq error...", error);
    }
  }
  async produce(data: any) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.producer.produceMessages(data);
  }
}

export default RabbitMQClient.getInstance();

##RabbitMQ example of the request-reply pattern using NodeJS (Typescript).

> We have 2 microservices : RPC_Client and RPC_Server

> Both of them play the roles of a Consumer and a Producer.

> RPC_Client, produces to an RPC Queue, to which the RPC_Server will be consuming messages from. And will then process the data, and return a response by producing to the Reply Queue, to which the RPC_Client will be consuming responses from.

# Task

- [ ] html only frontend to interect with code judge0
- [ ] functions mapping
- [ ] writing functions
- [ ] write code running logic on judge0

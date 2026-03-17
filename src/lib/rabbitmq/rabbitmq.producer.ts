import { getChannel } from "./rabbitmq.connection.js";

export const publishMessage = async (queue: string, message: any) => {
  const channel = getChannel();
  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};

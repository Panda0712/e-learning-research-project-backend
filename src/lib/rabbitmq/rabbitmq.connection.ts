import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672",
  );
  channel = await connection.createChannel();
  console.log("Đã kết nối RabbitMQ thành công");
};

export const getChannel = () => {
  if (!channel) throw new Error("RabbitMQ kết nối thất bại");
  return channel;
};

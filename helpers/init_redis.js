const redis = require("redis");

const client = redis.createClient({
  url: `redis://admin:pRh&99AG3EKE$XDd@redis-10942.c241.us-east-1-4.ec2.cloud.redislabs.com:10942`,
});

client
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error(err));

client.on("connect", () => {
  console.log("CLient connected to redis...");
});

client.on("ready", () => {
  console.log("CLient connected to redis and ready to use...");
});

client.on("error", (error) => {
  console.log(error.message);
});

client.on("end", () => {
  console.log("Client disconnected from redis");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;

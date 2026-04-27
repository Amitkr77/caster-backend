import { MongoClient } from "mongodb";

let client;

const connectDB = async () => {
  if (client) return client.db();

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  return client.db();
};

export default connectDB;
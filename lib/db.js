import { MongoClient } from "mongodb";

export const connectToDatabase = async () => {
  const client = await MongoClient.connect("mongodb://localhost:27017/Auth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client;
};

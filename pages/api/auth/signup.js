import { isEmail } from "validator/validator";
import { hashPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !isEmail(email) || !password || password.trim().length < 7) {
      return res.status(422).json({
        status: "error",
        message: "Invalid Inputs",
      });
    }

    const client = await connectToDatabase();
    const db = client.db();
    const user = await db.collection("users").findOne({ email });

    if (user) {
      client.close();
      return res.status(422).json({
        status: "error",
        message: "User with the Email Id Already Exists!",
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await db
      .collection("users")
      .insertOne({ email, password: hashedPassword });

    res.status(201).json({
      status: "success",
      message: "User created successfully!",
      data: result.ops[0],
    });
    client.close();
  }
  return;
};

export default handler;

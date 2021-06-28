import { getSession } from "next-auth/client";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

const handler = async (req, res) => {
  if (req.method !== "PATCH") {
    return;
  }
  const session = await getSession({ req: req });
  if (!session) {
    return res.status(401).json({
      status: "error",
      message: "Not Authenticated!",
    });
  }
  const userEmail = session.user.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const client = await connectToDatabase();
  const existingUser = await client
    .db()
    .collection("users")
    .findOne({ email: userEmail });

  if (!existingUser) {
    client.close();
    return res.status(404).json({
      status: "error",
      message: "User not Found!",
    });
  }

  const currentPassword = existingUser.password;
  const isValid = await verifyPassword(oldPassword, currentPassword);

  if (!isValid) {
    client.close();
    return res.status(403).json({
      status: "error",
      message: "Old Password doesn't Match!",
    });
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await client
    .db()
    .collection("users")
    .updateOne({ email: userEmail }, { $set: { password: hashedPassword } });

  client.close();

  res.status(200).json({
    status: "success",
    message: "Password Updated Successfully!",
  });
};

export default handler;

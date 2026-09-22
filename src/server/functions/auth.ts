import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "../db/mongodb";

const LoginInputSchema = z.object({
  identity: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["student", "faculty"]),
});

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => LoginInputSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await getDb();
    const { identity, password, role } = data;

    let user;
    if (role === "student") {
      user = await db.collection("users").findOne({ rollNumber: identity, role: "student" });
    } else {
      user = await db.collection("users").findOne({ username: identity, role: "faculty" });
    }

    if (!user) {
      throw new Error(`Invalid credentials for ${role} login.`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error(`Invalid credentials for ${role} login.`);
    }

    // Return sanitized user session object (never expose passwordHash)
    return {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      username: user.username,
      rollNumber: user.rollNumber,
      academicYear: user.academicYear || "III Year",
    };
  });

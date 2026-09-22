import bcrypt from "bcryptjs";
import { getDb } from "../db/mongodb";

export async function loginUser(data: { identity: string; password: string; role: "student" | "faculty" }) {
  const db = await getDb();
  const { identity, password, role } = data;

  let user;
  if (role === "student") {
    user = await db.collection("users").findOne({ rollNumber: identity.trim(), role: "student" });
  } else {
    user = await db.collection("users").findOne({ username: identity.trim(), role: "faculty" });
  }

  if (!user) {
    throw new Error(`Invalid credentials for ${role} login. If you are a new student, please Sign Up first.`);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error(`Invalid credentials for ${role} login.`);
  }

  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    username: user.username,
    rollNumber: user.rollNumber,
    academicYear: user.academicYear || "III Year",
  };
}

export async function signupUser(data: { rollNumber: string; name: string; password: string }) {
  const db = await getDb();
  const { rollNumber, name, password } = data;
  const cleanRollNo = rollNumber.trim();

  const existing = await db.collection("users").findOne({ rollNumber: cleanRollNo, role: "student" });
  if (existing) {
    throw new Error(`Student account with Roll Number '${cleanRollNo}' already exists. Please switch to Sign In.`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    rollNumber: cleanRollNo,
    name: name.trim(),
    passwordHash,
    role: "student" as const,
    academicYear: "III Year (Batch 2024-2027)",
    semesterNumber: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = await db.collection("users").insertOne(newUser);

  return {
    id: res.insertedId.toString(),
    name: newUser.name,
    role: newUser.role,
    rollNumber: newUser.rollNumber,
    academicYear: newUser.academicYear,
  };
}

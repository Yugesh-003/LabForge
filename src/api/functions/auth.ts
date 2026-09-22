import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loginUser, signupUser } from "../services/authService";

const LoginInputSchema = z.object({
  identity: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["student", "faculty"]),
});

const SignupInputSchema = z.object({
  rollNumber: z.string().min(2, "Roll number must be at least 2 characters"),
  name: z.string().min(2, "Full name is required"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => LoginInputSchema.parse(data))
  .handler(async ({ data }) => {
    return await loginUser(data);
  });

export const signupServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => SignupInputSchema.parse(data))
  .handler(async ({ data }) => {
    return await signupUser(data);
  });

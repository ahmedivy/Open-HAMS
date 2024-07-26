import * as z from "zod";

export const signupSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be between 2 and 50 characters")
    .max(50),
  last_name: z.string().optional(),
  username: z
    .string()
    .min(2, "Username must be between 2 and 50 characters")
    .max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be between 8 and 50 characters")
    .max(50),
});

export const loginSchema = z.object({
  username: z.string().min(2, "Email or username is required"),
  password: z
    .string()
    .min(8, "Password must be between 8 and 50 characters")
    .max(50),
});

export const changePasswordFormSchema = z.object({
  current_password: z.string().min(8).max(50),
  new_password: z.string().min(8).max(50),
  confirm_password: z.string().min(8).max(50),
});

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name is too short")
    .max(50, "First name is too long"),
  last_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

// export schmema types
export type SignUpSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordFormSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

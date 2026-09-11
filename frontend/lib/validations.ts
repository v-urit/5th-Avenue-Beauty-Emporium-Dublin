import { z } from "zod";

// Strict name regex: Unicode letters (\p{L}), spaces, hyphens, apostrophes. No emojis, numbers, or symbols.
const nameRegex = /^[\p{L}\s'-]{2,60}$/u;

// Strict phone regex: optional leading +, then 8 to 18 digits with optional spaces or hyphens.
const phoneRegex = /^\+?[0-9\s-]{8,18}$/;

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .regex(nameRegex, "Name cannot contain emojis, numbers, or special symbols"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || (phoneRegex.test(val) && !/[a-zA-Z]/.test(val)),
      {
        message: "Phone number cannot contain letters or names, only digits (e.g. +353 87 123 4567)",
      }
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginEmailInput = z.infer<typeof loginEmailSchema>;

export const loginPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Please enter a valid phone number with at least 8 digits")
    .regex(phoneRegex, "Phone number cannot contain letters or names, only digits")
    .refine((val) => !/[a-zA-Z]/.test(val), {
      message: "Phone number cannot contain letters or names",
    }),
});

export type LoginPhoneInput = z.infer<typeof loginPhoneSchema>;

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "Valid phone number required")
    .regex(phoneRegex, "Phone number cannot contain letters"),
  code: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain digits only"),
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .regex(nameRegex, "Name cannot contain emojis, numbers, or special symbols"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || (phoneRegex.test(val) && !/[a-zA-Z]/.test(val)),
      {
        message: "Phone number cannot contain letters or names, only digits (e.g. +353 87 123 4567)",
      }
    ),
  otp_code: z
    .string()
    .trim()
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;


import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyEmailOtp } from "@/lib/auth/verify-otp";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email OTP",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        code: {
          label: "Code",
          type: "text",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const code =
          typeof credentials?.code === "string"
            ? credentials.code.trim()
            : "";

        if (!email || !code) {
          return null;
        }

        const result = await verifyEmailOtp(email, code);

        if (!result.success) {
          return null;
        }

        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
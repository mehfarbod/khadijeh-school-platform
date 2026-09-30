import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      accountType: string;
      studentId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    accountType?: string;
    studentId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    accountType: string;
    studentId?: string;
  }
}

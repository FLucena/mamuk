import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Usar la configuración completa de authOptions desde src/lib/auth.ts
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
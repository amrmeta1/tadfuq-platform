import type { AuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles?: string[];
    tenantId?: string;
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    roles?: string[];
    tenantId?: string;
    userId?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.userId = profile?.sub;
        token.tenantId = (profile as any)?.["custom:tenant_id"];
        token.roles = (profile as any)?.["cognito:groups"] || ["user"];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      session.accessToken = token.accessToken as string;
      session.userId = token.userId as string;
      session.tenantId = token.tenantId as string;
      session.roles = token.roles as string[];
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
};

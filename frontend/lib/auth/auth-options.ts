import type { AuthOptions, TokenSet } from "next-auth";
import type { JWT } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles?: string[];
    tenantId?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    roles?: string[];
    tenantId?: string;
    error?: string;
  }
}

function extractRoles(token: Record<string, unknown>): string[] {
  try {
    const ra = token.resource_access as
      | Record<string, { roles?: string[] }>
      | undefined;
    return ra?.["cashflow-api"]?.roles ?? [];
  } catch {
    return [];
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });
    const refreshed: TokenSet & { expires_in?: number } = await res.json();
    if (!res.ok) throw new Error("RefreshTokenError");
    return {
      ...token,
      accessToken: refreshed.access_token!,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 900),
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token!;
        token.refreshToken = account.refresh_token!;
        token.expiresAt =
          Math.floor(Date.now() / 1000) + (Number(account.expires_in) || 900);
        const decoded = JSON.parse(
          Buffer.from(account.access_token!.split(".")[1], "base64").toString()
        );
        token.roles = extractRoles(decoded);
        token.tenantId = (profile as Record<string, unknown>)?.tenant_id as
          | string
          | undefined;
      }
      if (token.expiresAt && Date.now() / 1000 > token.expiresAt - 60) {
        return refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.roles = token.roles;
      session.tenantId = token.tenantId;
      session.error = token.error;
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

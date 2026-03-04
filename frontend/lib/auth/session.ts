/**
 * Conditional export of session hooks based on DEV_SKIP_AUTH
 * This allows the app to use mock session when DEV_SKIP_AUTH=true
 * without requiring NextAuth backend
 */

import * as NextAuth from "next-auth/react";
import * as MockAuth from "./mock-session-provider";

const DEV_SKIP_AUTH = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";

// Mock getSession that returns null
const mockGetSession = async () => null;

export const useSession = DEV_SKIP_AUTH ? MockAuth.useSession : NextAuth.useSession;
export const signIn = DEV_SKIP_AUTH ? MockAuth.signIn : NextAuth.signIn;
export const signOut = DEV_SKIP_AUTH ? MockAuth.signOut : NextAuth.signOut;
export const getSession = DEV_SKIP_AUTH ? mockGetSession : NextAuth.getSession;

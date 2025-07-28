import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { accounts: true }, // Include linked accounts
        });

        // If user doesn't exist
        if (!user) {
          return null;
        }

        // If user exists but has no password (OAuth-only account)
        if (!user.password) {
          // Get their OAuth providers for the error message
          const oauthProviders = user.accounts.map((acc) => acc.provider);

          // Throw a special error with provider information
          throw new Error(
            JSON.stringify({
              type: "OAuthOnlyAccount",
              email: user.email,
              providers: oauthProviders,
            })
          );
        }

        // Normal password validation
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", {
        email: user.email,
        provider: account?.provider,
        isNewUser: !user.id,
      });

      // Allow credentials sign-in
      if (account?.provider === "credentials") {
        return true;
      }

      // For OAuth providers
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if this specific provider is already linked
          const existingAccount = existingUser.accounts.find(
            (acc) => acc.provider === account.provider
          );

          if (existingAccount) {
            // Account already linked, allow sign in
            console.log(
              `✅ ${account.provider} already linked for ${user.email}`
            );
            return true;
          }

          // Check if user is currently authenticated (trying to link additional account)
          // This is tricky to detect, so we'll use a different approach

          // If this is a linking attempt (user already has other OAuth accounts), auto-link
          if (existingUser.accounts.length > 0 || existingUser.password) {
            try {
              // Auto-link the new provider to existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });

              console.log(
                `✅ Auto-linked ${account.provider} to existing user: ${user.email}`
              );

              // Make sure the sign-in uses the existing user ID
              user.id = existingUser.id;
              return true;
            } catch (error) {
              console.error("Failed to auto-link account:", error);
              // If auto-linking fails, redirect to account linking page
              return `/login/error?error=OAuthAccountNotLinked&email=${encodeURIComponent(
                user.email
              )}&provider=${account.provider}`;
            }
          } else {
            // This is a first-time user with this email trying different OAuth provider
            // Redirect to account linking page
            return `/login/error?error=OAuthAccountNotLinked&email=${encodeURIComponent(
              user.email
            )}&provider=${account.provider}`;
          }
        }

        // No existing user, allow new account creation
        console.log(
          `✅ Creating new user with ${account.provider}: ${user.email}`
        );
        return true;
      }

      return true;
    },
  },
};

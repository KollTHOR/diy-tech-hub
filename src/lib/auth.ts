// src/lib/auth.ts
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
        console.log("🔍 Credentials authorize called:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { accounts: true },
        });

        if (!user) {
          return null;
        }

        if (!user.password) {
          const oauthProviders = user.accounts.map((acc) => acc.provider);
          throw new Error(
            JSON.stringify({
              type: "OAuthOnlyAccount",
              email: user.email,
              providers: oauthProviders,
            })
          );
        }

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
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // ✅ Change from 'database' to 'jwt'
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {

      // Store user data in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      

      // Pass user data from JWT token to session
      if (session?.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("🚪 SignIn callback:", {
        email: user.email,
        provider: account?.provider,
      });

      // Allow credentials sign-in
      if (account?.provider === "credentials") {
        return true;
      }

      // Handle OAuth account linking (your existing logic)
      if (account?.provider && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          const hasProvider = existingUser.accounts.some(
            (acc) => acc.provider === account.provider
          );

          if (!hasProvider) {
            try {
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
              console.log(`✅ Linked ${account.provider} to ${user.email}`);
            } catch (error) {
              console.error("Account linking failed:", error);
            }
          }

          user.id = existingUser.id;
        }
      }

      return true;
    },
  },
};


import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
  },

  callbacks: {
    //Allow login only if email exists in Team DB
    async signIn({ user }) {
      try {
        await connectDB();

        if (!user.email) {
          console.log("Sign-in denied: No email provided in user object.");
          return false;
        }

        const teamExists = await Team.findOne({ email: user.email });

        if (!teamExists) {
          return false;
        }

        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },

   

    //  Runs on login & every request (JWT creation)
    async jwt({ token }) {
      if (!token.email) return token;

      await connectDB();

      const team = await Team.findOne({ email: token.email });

      if (team) {
        token.teamId = team._id.toString();
        token.teamName = team.teamName;
        token.setCodeforcesHandle = team.codeforcesHandle == null;
        token.hasRound2Access = team.hasRound2Access || false;
      }

      return token;
    },

    // Expose value to frontend session
    async session({ session, token }) {
      if (session.user) {
        session.user.setCodeforcesHandle =
          token.setCodeforcesHandle as boolean;
        session.user.teamId = token.teamId as string;
        session.user.teamName = token.teamName as string;
        session.user.hasRound2Access = token.hasRound2Access as boolean;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
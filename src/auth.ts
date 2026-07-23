import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const ALLOWED_GITHUB_LOGIN = "ledlaputa72";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async signIn({ profile }) {
      return (profile as { login?: string })?.login === ALLOWED_GITHUB_LOGIN;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

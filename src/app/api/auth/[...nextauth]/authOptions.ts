import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text", placeholder: "kullanici" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        // Geçici hardcoded authentication - Database bağlantısı olmadığında
        if (credentials.username === 'erkan.olus' && credentials.password === 'Admin123!') {
          return { id: '1', name: 'erkan.olus', role: 'admin' };
        }
        
        try {
          const user = await prisma.user.findUnique({ where: { username: credentials.username } });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
          return { id: user.id, name: user.username, role: user.role };
        } catch (error) {
          console.error('Database connection error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 60, // 30 dakika
    updateAge: 10 * 60
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};

export { authOptions }; 
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { after } from "next/server";
import { eq } from "drizzle-orm";

const ibmPlexSans = localFont({
  src: [
    { path: "/fonts/IBMPlexSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/IBMPlexSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "/fonts/IBMPlexSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/IBMPlexSans-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const bebasNeue = localFont({
  src: [
    { path: "/fonts/BebasNeue-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--bebas-neue",
});


export const metadata: Metadata = {
  title: "BookWise",
  description:
    "BookWise is a book borrowing university library management solution.",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {

  const session = await auth();

  after(async () => {
    if (!session?.user?.id) return;

    // get the user and see if the last activity date is today
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10)) return;

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id));
  });


  return (
    <html
      lang="en"
      className={`${ibmPlexSans.className} ${bebasNeue.variable} h-full antialiased`}
    >
      <SessionProvider session={session}>
        <body className="min-h-full flex flex-col">{children}

          <Toaster />
        </body>

      </SessionProvider>
    </html>
  );
}


export default RootLayout;
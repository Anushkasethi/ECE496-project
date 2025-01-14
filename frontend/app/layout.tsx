import Navigation from "@/components/navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/authcontext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

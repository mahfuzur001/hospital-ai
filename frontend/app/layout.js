import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { AuthProvider } from "../components/AuthProvider";
import ToastContainer from "../components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Smart Hospital — AI-Powered Hospital Management",
  description:
    "Industry-standard hospital management system with AI doctor consultation, appointment booking, and real-time dashboards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

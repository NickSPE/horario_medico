import { AuthProvider } from "@/contexts/AuthContext";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Horario médico - MedControl",
  description: "Control seguro de tratamientos médicos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-950 dark:to-surface-900 text-surface-900 dark:text-surface-100">
        <AuthProvider>
          <div className="container-responsive">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'notification-enter',
              style: {
                background: 'light-dark(var(--color-surface-50), var(--color-surface-900))',
                color: 'light-dark(var(--color-surface-900), var(--color-surface-100))',
                border: '1px solid light-dark(var(--color-surface-200), var(--color-surface-800))',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

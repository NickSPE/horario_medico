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

      {/*HEADER */}

      <body className="min-h-screen" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
        <AuthProvider>
          <div className="container">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
        </AuthProvider>

      </body>
    </html>
  );
}

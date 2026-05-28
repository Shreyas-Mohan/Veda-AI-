import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI Assessment Creator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen transition-colors duration-300">
        <Providers>
          <div className="print:hidden">
            <Toaster position="bottom-right" /> 
          </div>

          <div className="min-h-screen bg-[#e9e9e9] text-[#2b2b2b] dark:bg-background dark:text-foreground">
            <div className="print:hidden">
              <Sidebar />
            </div>

            <div className="min-h-screen lg:pl-[270px] print:pl-0">
              <div className="print:hidden">
                <Header />
              </div>

              <main className="min-h-[calc(100vh-5rem)] px-4 pb-8 pt-4 sm:px-6 lg:px-8 print:min-h-0 print:bg-white print:p-0">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

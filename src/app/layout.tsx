
import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "@/index.css";

export const metadata: Metadata = {
  title: "دبیرستان دخترانه شاهد حضرت خدیجه (س)",
  description:
    "دبیرستان دخترانه شاهد حضرت خدیجه (س) - محیطی برای رشد علمی، اخلاقی و خلاقانه",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

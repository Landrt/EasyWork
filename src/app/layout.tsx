import "./globals.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { AppHeader } from "@/components/layout/app-header";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://easywork.com"),
  title: {
    default: "EasyWork - Tailored ATS Resumes & AI Job Applications",
    template: "%s | EasyWork"
  },
  description: "Create tailored, ATS-optimized resumes and manage your job applications powered by AI. Land your dream job with EasyWork.",
  applicationName: "EasyWork",
  keywords: ["resume builder", "AI resume", "ATS optimization", "tech jobs", "career tools", "job application", "EasyWork"],
  authors: [{ name: "EasyWork" }],
  creator: "EasyWork",
  publisher: "EasyWork",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "EasyWork",
    title: "EasyWork - Tailored ATS Resumes & AI Job Applications",
    description: "Create tailored, ATS-optimized resumes and manage your job applications powered by AI.",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "EasyWork - AI Resume & Application Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyWork - Tailored ATS Resumes & AI Job Applications",
    description: "Create tailored, ATS-optimized resumes and manage your job applications powered by AI.",
    images: ["/og.webp"],
    creator: "@easywork",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { id: string; email?: string } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = data.user;
    }
  } catch {
    // Fallback mode local
  }
  
  const showUpgradeButton = false;

  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-[#fbf9f5] text-[#1C1B18] min-h-screen selection:bg-[#efeeea] selection:text-[#1C1B18]">
        <div className="relative min-h-screen h-screen flex flex-col">
          {user && <AppHeader showUpgradeButton={showUpgradeButton} />}
          {/* Padding for header and footer */}
          <main className={user ? "py-14 h-full" : "h-full"}>
            {children}
            <Analytics />
          </main>
          {user && <Footer /> }
        </div>
        <Toaster 
          richColors 
          position="top-right" 
          closeButton 
          toastOptions={{
            style: {
              fontSize: '1rem',
              padding: '16px',
              minWidth: '400px',
              maxWidth: '500px'
            }
          }}
        />
      </body>
    </html>
  );
}

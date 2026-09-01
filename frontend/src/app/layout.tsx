import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";

import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GenCV — CV honnête, adapté à l’offre",
    template: "%s · GenCV",
  },
  description:
    "Un CV en ligne qui part de votre parcours réel et de l’offre visée. L’IA n’invente ni compétence, ni chiffre.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-ink bg-parchment">
            <a
              href="#contenu"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-on-primary"
            >
              Aller au contenu
            </a>
            <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

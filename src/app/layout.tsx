import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ground Karate - BJJ Training Journal",
  description: "Track your Brazilian Jiu-Jitsu training, promotions, and progress",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light")return;document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpForceRedirectUrl="/profile"
      signUpFallbackRedirectUrl="/profile"
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "#18181b",
          colorInputBackground: "#09090b",
          colorPrimary: "#e4e4e7",
          colorText: "#ffffff",
          colorNeutral: "#52525b",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base text-fg`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

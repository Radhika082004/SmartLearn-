import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: "SmartLearn – AI-Powered Learning Platform",
  description: "Personalized AI-driven learning & skill recommendation platform that identifies skill gaps and recommends courses tailored to your career goals.",
};

import CustomCursor from "../components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <GoogleOAuthProvider clientId="727814421527-uvfg4sfngt5hk71mdi5upap9gohj70p5.apps.googleusercontent.com">
          {children}
          <CustomCursor />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

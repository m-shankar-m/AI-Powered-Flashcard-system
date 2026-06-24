import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Powered Flashcard System",
  description: "Learn with AI-generated flashcards and voice grading.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

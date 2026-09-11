import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In | 5th Avenue Beauty Emporium",
  description:
    "Access your 5th Avenue Beauty Emporium client portal to view and manage your appointments.",
  alternates: { canonical: "/login" },
  // Auth pages carry no unique content — keep them out of the index.
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}

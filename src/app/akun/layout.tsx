import type { ReactNode } from "react";

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
    </div>
  );
}

    
import type { ReactNode } from "react";

// Route changes are covered by NavigationTransition. Keeping page content
// opaque prevents a white flash while the diagonal panels are opening.
export function PageTransition({ children }: { children: ReactNode }) {
  return <div data-route-page>{children}</div>;
}

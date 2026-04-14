import { redirect } from "next/navigation";

// next-intl middleware redirects `/` → `/{defaultLocale}` before this runs.
// This is a safety fallback only.
export default function RootPage() {
  redirect("/en");
}

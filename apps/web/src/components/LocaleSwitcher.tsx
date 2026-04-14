"use client";

import { Button } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const t = useTranslations("locale");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    // Replace the leading locale segment in the pathname
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex gap-1" data-tour="locale-switcher">
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          variant={loc === locale ? "default" : "ghost"}
          size="sm"
          onClick={() => switchLocale(loc)}
          aria-current={loc === locale ? "true" : undefined}
        >
          {t(loc)}
        </Button>
      ))}
    </div>
  );
}

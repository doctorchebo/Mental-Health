"use client";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-semibold text-primary text-lg"
        >
          LunaJoy
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {user && (
            <>
              <Button variant="ghost" size="sm" onClick={logout}>
                {t("logout")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

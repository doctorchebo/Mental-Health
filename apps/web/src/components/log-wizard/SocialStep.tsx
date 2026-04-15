"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

interface Props {
  socialInteractions: number;
  notes: string;
  onInteractionsChange: (v: number) => void;
  onNotesChange: (v: string) => void;
}

export default function SocialStep({
  socialInteractions,
  notes,
  onInteractionsChange,
  onNotesChange,
}: Props) {
  const t = useTranslations("log.steps.social");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("interactionsLabel")}</Label>
        <span className="text-center text-3xl">
          {socialEmoji(socialInteractions)}
        </span>
        <Slider
          min={0}
          max={20}
          step={1}
          value={[socialInteractions]}
          onValueChange={([v]) => onInteractionsChange(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium">{socialInteractions}</span>
          <span>20+</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>{t("notesLabel")}</Label>
        <Textarea
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {notes.length}/1000
        </p>
      </div>
    </div>
  );
}

function socialEmoji(n: number): string {
  if (n === 0) return "🙈";
  if (n <= 2) return "😶";
  if (n <= 4) return "😐";
  if (n <= 7) return "🙂";
  if (n <= 10) return "😊";
  if (n <= 14) return "😄";
  if (n <= 17) return "🎉";
  return "🌟";
}

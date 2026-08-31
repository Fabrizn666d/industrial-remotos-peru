import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  accent?: string;
  align?: "left" | "center";
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  accent,
  align = "left",
  light = false
}: SectionHeadingProps) {
  const accentIndex = accent ? title.toLowerCase().indexOf(accent.toLowerCase()) : -1;

  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p
        className={cn(
          "eyebrow",
          light && "eyebrow-light",
          align === "center" && "justify-center"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "display-title mt-4",
          align === "center" && "mx-auto",
          light ? "text-white" : "text-surface-ink"
        )}
      >
        {accent && accentIndex >= 0 ? (
          <>
            {title.slice(0, accentIndex)}
            <span className={light ? "text-brand-400" : "text-brand-600"}>
              {title.slice(accentIndex, accentIndex + accent.length)}
            </span>
            {title.slice(accentIndex + accent.length)}
          </>
        ) : (
          title
        )}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-7",
            light ? "text-white/72" : "text-surface-500"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

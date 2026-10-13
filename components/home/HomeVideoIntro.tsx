"use client";

import { useEffect, useRef, useState } from "react";
import { useHomeIntro } from "@/components/HomeIntroController";
import type { HomeContent } from "@/lib/cms/content-contracts";

type HeroContent = HomeContent["hero"];

export function HomeVideoIntro({ content }: { content: HeroContent }) {
  const { status, markPlaying, complete, fail } = useHomeIntro();
  const videoRef = useRef<HTMLVideoElement>(null);
  const endTimerRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const active = content.mode === "composition" && !["completed", "failed", "skipped"].includes(status);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      video.currentTime = 0;
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        fail();
      });
    };
    if (document.documentElement.hasAttribute("data-irp-route-transition")) {
      window.addEventListener("irp:route-transition-complete", start, { once: true });
      return () => window.removeEventListener("irp:route-transition-complete", start);
    }
    start();
  }, [active, fail]);

  useEffect(() => {
    if (!leaving) return;
    const fallback = window.setTimeout(complete, 500);
    return () => window.clearTimeout(fallback);
  }, [complete, leaving]);

  useEffect(() => () => {
    if (endTimerRef.current !== null) window.clearTimeout(endTimerRef.current);
  }, []);

  if (!active) return null;
  const hero = content.composition;

  return (
    <div
      className="irp-home-video-intro"
      data-leaving={leaving || undefined}
      role="status"
      aria-label="Presentación de Industrial Remotos Perú"
      onTransitionEnd={(event) => {
        if (leaving && event.target === event.currentTarget && event.propertyName === "opacity") complete();
      }}
    >
      <video
        ref={videoRef}
        className="irp-home-video-intro__media"
        src={hero.desktopVideo.src}
        poster={hero.desktopPoster.src}
        preload="auto"
        muted
        playsInline
        disablePictureInPicture
        tabIndex={-1}
        aria-label={hero.desktopVideo.alt}
        onPlaying={markPlaying}
        onEnded={() => {
          endTimerRef.current = window.setTimeout(() => setLeaving(true), 260);
        }}
        onError={(event) => {
          if (event.currentTarget.error && event.currentTarget.error.code !== 1) fail();
        }}
      />
    </div>
  );
}

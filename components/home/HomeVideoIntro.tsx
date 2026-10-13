"use client";

import { useEffect, useRef, useState } from "react";
import { useHomeIntro } from "@/components/HomeIntroController";
import type { HomeContent } from "@/lib/cms/content-contracts";

type HeroContent = HomeContent["hero"];

export function HomeVideoIntro({ content }: { content: HeroContent }) {
  const { status, markPlaying, complete, fail } = useHomeIntro();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [leaving, setLeaving] = useState(false);
  const active = content.mode === "composition" && !["completed", "failed", "skipped"].includes(status);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => fail());
  }, [active, fail]);

  useEffect(() => {
    if (!leaving) return;
    const fallback = window.setTimeout(complete, 500);
    return () => window.clearTimeout(fallback);
  }, [complete, leaving]);

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
        poster={hero.desktopPoster.src}
        preload="auto"
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        tabIndex={-1}
        aria-label={hero.desktopVideo.alt}
        onPlaying={markPlaying}
        onEnded={() => setLeaving(true)}
        onError={fail}
      >
        <source media="(max-width: 767px)" src={hero.mobileVideo.src} type="video/mp4" />
        <source media="(min-width: 768px)" src={hero.desktopVideo.src} type="video/mp4" />
      </video>
    </div>
  );
}

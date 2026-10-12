"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AboutContent } from "@/lib/cms/content-contracts";
import styles from "@/app/(site)/nosotros/AboutPage.module.css";

const objectPosition = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" } as const;

export function AboutPresentationMedia({ presentation }: { presentation: AboutContent["presentation"] }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const poster = presentation.videoPoster.src ? presentation.videoPoster : presentation.image;

  useEffect(() => {
    if (!playing) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [playing]);

  return (
    <div className={styles.presentationMedia} data-about-presentation-media data-has-video={presentation.videoSrc ? "true" : "false"}>
      {playing && presentation.videoSrc ? (
        <video
          ref={videoRef}
          src={presentation.videoSrc}
          poster={poster.src}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label="Video de presentación de Industrial Remotos Perú"
        />
      ) : (
        <>
          <Image
            src={poster.src || presentation.image.src}
            alt={poster.alt || presentation.image.alt}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 900px) 58vw, 100vw"
            className={styles.cover}
            style={{ objectPosition: objectPosition[poster.position] }}
            data-transition-essential
          />
          {presentation.videoSrc && (
            <button type="button" className={styles.presentationPlay} onClick={() => setPlaying(true)} aria-label="Reproducir video Quiénes somos">
              <Play aria-hidden="true" fill="currentColor" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

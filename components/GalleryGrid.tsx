"use client";

import Image from "next/image";
import { useState } from "react";
import {
  GALLERY_CATEGORIES,
  type GalleryPhoto,
} from "@/lib/photos";

export default function GalleryGrid({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  const [cat, setCat] =
    useState<
      (typeof GALLERY_CATEGORIES)[number]
    >("all");

  const [active, setActive] =
    useState<GalleryPhoto | null>(
      null
    );

  const filtered =
    cat === "all"
      ? photos
      : photos.filter(
          (photo) =>
            photo.category === cat
        );

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {GALLERY_CATEGORIES.map(
          (category) => (
            <button
              key={category}
              onClick={() =>
                setCat(category)
              }
              className={`rounded-full px-4 py-1.5 font-display text-base tracking-wider2 transition ${
                cat === category
                  ? "bg-gold text-ink"
                  : "border border-neutral-700 text-neutral-300 hover:border-gold hover:text-gold"
              }`}
            >
              {category === "all"
                ? "All"
                : category}
            </button>
          )
        )}
      </div>

      <div className="mt-10 columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {filtered.map(
          (photo, index) => (
            <button
              key={photo.id}
              onClick={() =>
                setActive(photo)
              }
              className={`group relative block w-full overflow-hidden rounded-lg ${
                index % 5 === 0
                  ? "aspect-[3/4]"
                  : index % 5 === 1
                    ? "aspect-square"
                    : "aspect-[4/5]"
              }`}
            >
              {photo.media_type ===
              "video" ? (
                <video
                  src={photo.src}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                />
              )}

              <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/30" />

              {photo.media_type ===
                "video" && (
                <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Video
                </span>
              )}

              {photo.caption && (
                <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/90 to-transparent p-3 text-left text-xs text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  {photo.caption}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
          onClick={() =>
            setActive(null)
          }
        >
          <button
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-white hover:border-gold hover:text-gold"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <figure
            className="max-h-full max-w-5xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {active.media_type ===
            "video" ? (
              <video
                src={active.src}
                controls
                autoPlay
                playsInline
                className="max-h-[82svh] w-auto rounded-lg"
              />
            ) : (
              <Image
                src={active.src}
                alt={active.alt}
                width={1600}
                height={1200}
                className="max-h-[82svh] w-auto rounded-lg object-contain"
              />
            )}

            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-neutral-300">
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
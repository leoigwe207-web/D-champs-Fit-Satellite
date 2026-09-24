"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  useTransition,
} from "react";

import type {
  GalleryPhoto,
} from "@/lib/photos";

import {
  addGalleryMedia,
  deleteGalleryImage,
  updateGalleryImage,
} from "./actions";

import { createClient } from "@/lib/supabase-browser";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const MAX_VIDEO_SIZE =
  50 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export default function GalleryManager({
  photos,
}: {
  photos: GalleryPhoto[];
}) {
  const [pending, start] =
    useTransition();

  const [caption, setCaption] =
    useState("");

  const [category, setCategory] =
    useState("gym");

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  async function uploadFile(
    file: File
  ) {
    setError(null);
    setSuccess(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError(
        "Unsupported file type. Use JPG, PNG, WEBP, MP4, WEBM, or MOV."
      );
      return;
    }

    const isVideo =
      file.type.startsWith("video/");

    const maxSize = isVideo
      ? MAX_VIDEO_SIZE
      : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      setError(
        isVideo
          ? "Videos must be 50 MB or smaller."
          : "Images must be 10 MB or smaller."
      );
      return;
    }

    const sb = createClient();

    if (!sb) {
      setError(
        "Supabase is not configured."
      );
      return;
    }

    const extension =
      file.name.includes(".")
        ? file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "bin"
        : "bin";

    const path =
      `gallery/${crypto.randomUUID()}.${extension}`;

    try {
      const { error: uploadError } =
        await sb.storage
          .from("gym-assets")
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",
              upsert: false,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }

      const {
        data: publicUrlData,
      } = sb.storage
        .from("gym-assets")
        .getPublicUrl(path);

      const publicUrl =
        publicUrlData.publicUrl;

      await addGalleryMedia({
        src: publicUrl,
        storage_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        media_type: isVideo
          ? "video"
          : "image",
        caption,
        category,
      });

      setCaption("");
      setSuccess(
        `${isVideo ? "Video" : "Image"} uploaded successfully.`
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    } catch (err) {
      console.error(
        "Media upload failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Upload failed."
      );

      // Clean up orphaned storage
      // file if DB insert failed.
      try {
        await sb.storage
          .from("gym-assets")
          .remove([path]);
      } catch {
        // Ignore cleanup failure.
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-dark">
        <h2 className="font-display text-xl tracking-wider2 text-gold">
          UPLOAD MEDIA
        </h2>

        <p className="mt-1 text-xs text-neutral-500">
          Images up to 10 MB. Videos up to
          50 MB.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
            disabled={pending}
            className="block w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-2 file:font-bold file:text-black"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (file) {
                start(() =>
                  uploadFile(file)
                );
              }
            }}
          />

          <input
            className="input-dark"
            placeholder="Caption"
            value={caption}
            disabled={pending}
            maxLength={300}
            onChange={(e) =>
              setCaption(
                e.target.value
              )
            }
          />

          <select
            className="input-dark"
            value={category}
            disabled={pending}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >
            {[
              "gym",
              "equipment",
              "facility",
              "exterior",
              "training",
            ].map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>
        </div>

        {pending && (
          <p className="mt-3 text-sm text-gold">
            Uploading…
          </p>
        )}

        {success && (
          <p className="mt-3 rounded-md border border-green-900 bg-green-950/40 px-3 py-2 text-sm text-green-300">
            {success}
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="overflow-hidden rounded-lg border border-neutral-800 bg-ink2"
          >
            <div className="relative aspect-[4/3] bg-black">
              {photo.media_type ===
              "video" ? (
                <video
                  src={photo.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  unoptimized={photo.src.startsWith(
                    "http"
                  )}
                />
              )}
            </div>

            <div className="p-3">
              <input
                className="input-dark !py-1.5 !text-xs"
                defaultValue={
                  photo.caption ?? ""
                }
                placeholder="Caption"
                disabled={photo.isLocal}
                title={
                  photo.isLocal
                    ? "Bundled static photo — not editable"
                    : undefined
                }
                onBlur={(e) => {
                  if (
                    e.target.value !==
                    (photo.caption ?? "")
                  ) {
                    const value =
                      e.target.value;

                    start(() =>
                      updateGalleryImage(
                        photo.id,
                        {
                          caption: value,
                        }
                      )
                    );
                  }
                }}
              />

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="badge bg-neutral-800 text-neutral-400">
                  {photo.isLocal
                    ? "STATIC"
                    : photo.media_type ===
                        "video"
                      ? "VIDEO"
                      : photo.category}
                </span>

                {photo.isLocal ? (
                  <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                    Bundled
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      start(() =>
                        deleteGalleryImage(
                          photo.id
                        )
                      )
                    }
                    disabled={pending}
                    className="text-xs font-bold uppercase text-red-400 hover:underline disabled:opacity-40"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
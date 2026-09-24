"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-guard";

const Caption = z.string().max(300);

const Category = z.enum([
  "gym",
  "equipment",
  "facility",
  "exterior",
  "training",
]);

const MediaType = z.enum([
  "image",
  "video",
]);

const Id = z.string().uuid();

const StoragePath = z
  .string()
  .min(1)
  .max(500)
  .refine(
    (value) => !value.includes(".."),
    "Invalid storage path"
  );

const Url = z
  .string()
  .url()
  .max(2048)
  .refine(
    (url) => /^https?:\/\//i.test(url),
    "Only http(s) URLs are allowed"
  );

export async function addGalleryImage(
  url: string,
  caption: string,
  category: string
) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error(
      "Authentication required."
    );
  }

  const parsed = z
    .object({
      url: Url,
      caption: Caption,
      category: Category,
    })
    .safeParse({
      url,
      caption,
      category,
    });

  if (!parsed.success) {
    throw new Error(
      "Invalid image details."
    );
  }

  const { error } = await admin
    .from("gallery")
    .insert({
  image_url: parsed.data.url,
  src: parsed.data.url,

  title:
    parsed.data.caption ||
    "D'Champs Fit",

  alt:
    parsed.data.caption ||
    "D'Champs Fit",

  caption:
    parsed.data.caption,

  category:
    parsed.data.category,

  is_featured: false,
  featured: false,

  sort: 50,

  media_type: "image",
})

  if (error) {
    console.error(
      "Gallery image insert failed:",
      error
    );

    throw new Error(
      "Could not add image."
    );
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function addGalleryMedia(
  values: {
    src: string;
    storage_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    media_type: "image" | "video";
    caption: string;
    category: string;
  }
) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error(
      "Authentication required."
    );
  }

  const parsed = z
    .object({
      src: Url,
      storage_path: StoragePath,
      file_name: z
        .string()
        .min(1)
        .max(255),
      file_size: z
        .number()
        .int()
        .positive()
        .max(60 * 1024 * 1024),
      mime_type: z
        .string()
        .min(1)
        .max(100),
      media_type: MediaType,
      caption: Caption,
      category: Category,
    })
    .safeParse(values);

  if (!parsed.success) {
    throw new Error(
      "Invalid media details."
    );
  }
const { error } = await admin
  .from("gallery")
  .insert({
    // Keep the original required field populated.
    image_url: parsed.data.src,

    // New unified media URL field.
    src: parsed.data.src,

    title:
      parsed.data.caption ||
      "D'Champs Fit",

    alt:
      parsed.data.caption ||
      "D'Champs Fit",

    caption:
      parsed.data.caption,

    category:
      parsed.data.category,

    is_featured: false,
    featured: false,

    sort: 50,

    media_type:
      parsed.data.media_type,

    mime_type:
      parsed.data.mime_type,

    storage_path:
      parsed.data.storage_path,

    file_name:
      parsed.data.file_name,

    file_size:
      parsed.data.file_size,
  });

  if (error) {
    console.error(
      "Gallery media insert failed:",
      error
    );

    // Orphan cleanup: the file is already in Storage but has no database
    // row — remove it so Storage never accumulates orphaned uploads.
    // Only the just-uploaded path is removed; nothing else is touched.
    try {
      await admin.storage
        .from("gym-assets")
        .remove([parsed.data.storage_path]);
    } catch {
      // Cleanup failure is non-fatal.
    }

    throw new Error(
      "Could not save uploaded media. The file was uploaded but could not be registered."
    );
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function updateGalleryImage(
  id: string,
  values: {
    caption?: string;
    category?: string;
    featured?: boolean;
  }
) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error(
      "Authentication required."
    );
  }

  const parsed = z
    .object({
      caption:
        Caption.optional(),

      category:
        Category.optional(),

      featured:
        z.boolean().optional(),
    })
    .safeParse(values);

  if (!parsed.success) {
    throw new Error(
      "Invalid media values."
    );
  }

  const { error } = await admin
    .from("gallery")
    .update(parsed.data)
    .eq(
      "id",
      Id.parse(id)
    );

  if (error) {
    throw new Error(
      "Could not update media."
    );
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deleteGalleryImage(
  id: string
) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error(
      "Authentication required."
    );
  }

  const mediaId =
    Id.parse(id);

  // Find the storage path first.
  const { data: media } =
    await admin
      .from("gallery")
      .select(
        "storage_path"
      )
      .eq("id", mediaId)
      .maybeSingle();

  // Remove physical file from Storage.
  if (
    media?.storage_path
  ) {
    const { error: storageError } =
      await admin.storage
        .from("gym-assets")
        .remove([
          media.storage_path,
        ]);

    if (storageError) {
      console.error(
        "Storage deletion failed:",
        storageError
      );

      throw new Error(
        "The file could not be removed from storage."
      );
    }
  }

  // Remove database record.
  const { error } =
    await admin
      .from("gallery")
      .delete()
      .eq(
        "id",
        mediaId
      );

  if (error) {
    throw new Error(
      "Could not delete media."
    );
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
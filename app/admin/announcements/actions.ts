"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin-guard";

const Create = z.object({
  type: z.enum([
    "gym_announcement",
    "new_membership_offer",
    "holiday_hours",
    "new_trainer",
  ]),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(2000),
});

const Id = z.string().uuid();

export async function createAnnouncement(values: {
  type: string;
  title: string;
  body: string;
}) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error("Supabase is not configured.");
  }

  const parsed = Create.safeParse(values);

  if (!parsed.success) {
    throw new Error("Invalid announcement.");
  }

  // Save using the ACTUAL database column names:
  // title, message, is_published.
  const {
    data: announcement,
    error: announcementError,
  } = await admin
    .from("announcements")
    .insert({
      title: parsed.data.title,
      message: parsed.data.body,
      is_published: true,
    })
    .select("id, title, message, is_published, created_at")
    .single();

  if (announcementError || !announcement) {
    console.error(
      "Announcement insert failed:",
      announcementError
    );

    throw new Error(
      announcementError?.message ??
        "The announcement could not be published."
    );
  }

  // Get all members who have an account.
  const {
    data: members,
    error: membersError,
  } = await admin
    .from("members")
    .select("user_id")
    .not("user_id", "is", null)
    .limit(5000);

  if (membersError) {
    console.error(
      "Member lookup failed:",
      membersError
    );

    throw new Error(
      "The announcement was published, but member notifications could not be prepared."
    );
  }

  const userIds = Array.from(
    new Set(
      (members ?? [])
        .map((member) => member.user_id)
        .filter(
          (userId): userId is string =>
            typeof userId === "string" &&
            userId.length > 0
        )
    )
  );

  // Create a notification for every member.
  if (userIds.length > 0) {
    const notificationRows = userIds.map(
      (userId) => ({
        user_id: userId,
        title: parsed.data.title,
        body: parsed.data.body,
      })
    );

    const {
      error: notificationError,
    } = await admin
      .from("notifications")
      .insert(notificationRows);

    if (notificationError) {
      console.error(
        "Notification insert failed:",
        notificationError
      );

      throw new Error(
        "The announcement was published, but member notifications could not be created."
      );
    }
  }

  // Email is intentionally optional for now.
  // It will only run after RESEND_API_KEY and
  // RESEND_FROM_EMAIL are configured.
  let emailStatus:
    | "sent"
    | "not_configured"
    | "failed" = "not_configured";

  let emailCount = 0;

  const resendApiKey =
    process.env.RESEND_API_KEY;

  const resendFrom =
    process.env.RESEND_FROM_EMAIL;

  if (resendApiKey && resendFrom) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const recipients: string[] = [];

      let page = 1;

      while (true) {
        const {
          data: users,
          error: usersError,
        } = await admin.auth.admin.listUsers({
          page,
          perPage: 100,
        });

        if (usersError) {
          console.error(
            "Auth users lookup failed:",
            usersError
          );
          emailStatus = "failed";
          break;
        }

        for (const user of users.users) {
          if (
            user.email &&
            userIds.includes(user.id)
          ) {
            recipients.push(user.email);
          }
        }

        if (users.users.length < 100) {
          break;
        }

        page += 1;
      }

      if (emailStatus !== "failed") {
        for (
          let i = 0;
          i < recipients.length;
          i += 100
        ) {
          const batch = recipients
            .slice(i, i + 100)
            .map((email) => ({
              from: resendFrom,
              to: [email],
              subject: `D'Champs Fit — ${parsed.data.title}`,
              html: `
                <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px">
                  <h1 style="color:#d9a62e">
                    D'CHAMPS FIT
                  </h1>

                  <h2>
                    ${escapeHtml(parsed.data.title)}
                  </h2>

                  <p style="line-height:1.6;white-space:pre-line">
                    ${escapeHtml(parsed.data.body)}
                  </p>

                  <p style="color:#777;margin-top:24px">
                    D'Champs Fit Satellite
                  </p>
                </div>
              `,
            }));

          if (!batch.length) continue;

          const { error: emailError } =
            await resend.batch.send(batch, {
              idempotencyKey:
                `announcement/${announcement.id}/batch/${i}`,
            });

          if (emailError) {
            console.error(
              "Resend batch failed:",
              emailError
            );

            emailStatus = "failed";
            break;
          }

          emailCount += batch.length;
          emailStatus = "sent";
        }
      }
    } catch (error) {
      console.error(
        "Email delivery failed:",
        error
      );

      emailStatus = "failed";
    }
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/notifications");

  return {
    success: true,
    announcementId: announcement.id,
    notificationCount: userIds.length,
    emailCount,
    emailStatus,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function deleteAnnouncement(
  id: string
) {
  const admin = await assertAdmin();

  if (!admin) {
    throw new Error("Supabase is not configured.");
  }

  const announcementId = Id.parse(id);

  // The announcement's body is stored as the notification `body` when the
  // fan-out created per-member copies — remove those too so members no
  // longer see a deleted announcement in their feed.
  const { data: announcement } = await admin
    .from("announcements")
    .select("title, message")
    .eq("id", announcementId)
    .maybeSingle();

  const { error } = await admin
    .from("announcements")
    .delete()
    .eq("id", announcementId);

  if (error) {
    throw new Error(
      "The announcement could not be deleted."
    );
  }

  if (announcement) {
    const { error: notifError } = await admin
      .from("notifications")
      .delete()
      .eq("title", announcement.title)
      .eq("body", announcement.message);

    if (notifError) {
      console.error("Notification cleanup failed:", notifError);
    }
  }

  revalidatePath("/admin/announcements");
  revalidatePath("/dashboard/notifications");
}
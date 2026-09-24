"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertStaff, assertAdmin } from "@/lib/admin-guard";

const Id = z.string().uuid();

export async function suspendMember(memberId: string) {
  const admin = await assertStaff();
  if (!admin) return;
  const id = Id.parse(memberId);
  await admin.from("members").update({ status: "suspended" }).eq("id", id);
  revalidatePath("/admin/members");
}

export async function reactivateMember(memberId: string) {
  const admin = await assertStaff();
  if (!admin) return;
  const id = Id.parse(memberId);
  const { data: member } = await admin
    .from("members")
    .select("end_date")
    .eq("id", id)
    .single();
  const isExpired =
    member?.end_date && new Date(member.end_date) < new Date();
  await admin
    .from("members")
    .update({ status: isExpired ? "expired" : "active" })
    .eq("id", id);
  revalidatePath("/admin/members");
}

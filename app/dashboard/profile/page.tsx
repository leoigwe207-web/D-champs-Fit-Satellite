import { getCurrentUser, getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const [user, member] = await Promise.all([getCurrentUser(), getCurrentMember()]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-white">PROFILE</h1>

      <div className="card-dark">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 font-display text-3xl text-gold">
            {user?.full_name?.[0] ?? "M"}
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider2 text-white">{user?.full_name}</h2>
            <p className="text-sm text-neutral-400">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Phone</dt>
            <dd className="mt-1 text-white">{user?.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Member code</dt>
            <dd className="mt-1 font-mono text-gold">{member?.member_code}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Role</dt>
            <dd className="mt-1 capitalize text-white">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider2 text-neutral-500">Account status</dt>
            <dd className="mt-1 capitalize text-white">{member?.status ?? "—"}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-neutral-500">
          To update your details, message reception on WhatsApp — staff can edit
          your profile in seconds.
        </p>
      </div>
    </div>
  );
}

import { getMemberNotifications } from "@/lib/member-data";
import { formatDateTime } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function MemberNotificationsPage() {
  const notifications = await getMemberNotifications();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-white">NOTIFICATIONS</h1>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card-dark border-l-4 ${n.read ? "border-l-neutral-700" : "border-l-gold"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-white">{n.title}</p>
              {!n.read && <span className="badge bg-gold/15 text-gold">New</span>}
            </div>
            <p className="mt-1 text-sm text-neutral-400">{n.body}</p>
            <p className="mt-2 text-xs text-neutral-600">{formatDateTime(n.created_at)}</p>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="card-dark text-center text-neutral-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}

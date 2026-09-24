import { getPublicAnnouncements } from "@/lib/content";
import AnnouncementCreate from "./AnnouncementCreate";
import AnnouncementRow from "./AnnouncementRow";
import { formatDate } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getPublicAnnouncements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-wide text-white">ANNOUNCEMENTS</h1>
        <p className="text-sm text-neutral-500">
          Members see these inside their dashboard.
        </p>
      </div>

      <AnnouncementCreate />

      <div className="space-y-3">
        {announcements.map((a) => (
          <AnnouncementRow key={a.id} id={a.id} title={a.title} body={a.body} type={a.type} created_at={formatDate(a.created_at)} />
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import { getCurrentUser, getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MemberQRPage() {
  const [user, member] = await Promise.all([
    getCurrentUser(),
    getCurrentMember(),
  ]);

  let qrDataUrl: string | null = null;

  try {
    const QRCode = (await import("qrcode")).default;

    if (member?.qr_token) {
      qrDataUrl = await QRCode.toDataURL(
        member.qr_token,
        {
          margin: 2,
          width: 480,
          color: {
            dark: "#0B0B0B",
            light: "#FFFFFF",
          },
        }
      );
    }
  } catch (error) {
    console.error("QR generation failed:", error);
    qrDataUrl = null;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl tracking-wide text-white">
        MY QR CODE
      </h1>

      <div className="mx-auto max-w-sm text-center">
        <div className="card-dark flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-wider2 text-neutral-500">
            Member check-in card
          </p>

          <h2 className="mt-1 font-display text-2xl tracking-wider2 text-white">
            {user?.full_name ?? "Member"}
          </h2>

          <p className="font-mono text-sm text-gold">
            {member?.member_code ?? "—"}
          </p>

          <div className="mt-5 rounded-xl bg-white p-4">
            {qrDataUrl ? (
              <Image
                src={qrDataUrl}
                alt="Secure D'Champs Fit member check-in QR code"
                width={240}
                height={240}
                unoptimized
              />
            ) : (
              <div className="flex h-[240px] w-[240px] items-center justify-center text-center text-sm text-neutral-400">
                QR code unavailable.
                <br />
                Please contact reception.
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed text-neutral-400">
            Show this QR code to D&apos;Champs Fit reception.
            Staff will scan it to record your attendance.
          </p>
        </div>
      </div>
    </div>
  );
}
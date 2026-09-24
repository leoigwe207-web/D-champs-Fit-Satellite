import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-ink2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-gold font-display text-xl text-ink">
              D
            </span>
            <span className="font-display text-2xl tracking-wider2 text-white">
              D&apos;CHAMPS <span className="text-gold">FIT</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-neutral-400">
            {SITE.area}
            <br />
            {SITE.phone}
          </p>
        </div>

        <FooterNav />

        <div>
          <h4 className="font-display text-lg tracking-wider2 text-gold">Follow</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            <li><a href={SITE.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a></li>
            {SITE.facebook && (
              <li><a href={SITE.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a></li>
            )}
            <li><a href={SITE.tiktok} target="_blank" rel="noreferrer" className="hover:text-gold">TikTok</a></li>
            <li>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg tracking-wider2 text-gold">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            <li><Link href="/privacy" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-gold">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800/70 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {SITE.fullName}. Satellite Town, Lagos.
      </div>
    </footer>
  );
}

function FooterNav() {
  return (
    <div>
      <h4 className="font-display text-lg tracking-wider2 text-gold">Explore</h4>
      <ul className="mt-3 space-y-2 text-sm text-neutral-400">
        {NAV_LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-gold">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

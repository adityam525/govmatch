import Link from "next/link";
import DisclaimerBar from "./DisclaimerBar";

const footerLinks = {
  Platform: [
    { label: "Jobs", href: "/jobs" },
    { label: "Upcoming Exams", href: "/exams" },
    { label: "Study Zone", href: "/study-zone" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-white font-bold text-lg mb-2">GovMatch</p>
          <p className="text-sm">Your Career. Our Mission.</p>
        </div>
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <p className="text-white text-sm font-semibold mb-3">{section}</p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <DisclaimerBar />
    </footer>
  );
}

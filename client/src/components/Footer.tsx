import { Link } from "react-router-dom";
import { bottomLinks, footerSections, socialLinks } from "../assets/assets";
import Brand from "./Brand.tsx";

export default function Footer() {
    return (
        <footer className="w-full bg-surface-container-low border-t border-outline-variant/60 pt-16 pb-10 mt-auto">
            <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="md:col-span-1">
                    <Link to="/" className="block mb-3">
                        <Brand size="text-3xl" />
                    </Link>

                    <p className="text-ink/60 text-sm leading-relaxed pr-4">
                        Balochi &amp; Sindhi charcoal cooking, karahi and dampukht — served in the heart of Hyderabad
                        since 1987.
                    </p>
                </div>

                {/* Sections */}
                {footerSections.map((section) => (
                    <div key={section.title} className="flex flex-col gap-3.5">
                        <h4 className="text-xs font-bold tracking-widest text-secondary uppercase">{section.title}</h4>
                        {section.links.map((link) => (
                            <Link
                                key={link.label}
                                to={link.path}
                                className="text-sm text-ink/65 hover:text-secondary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                ))}

                {/* Contact */}
                <div className="flex flex-col gap-3.5">
                    <h4 className="text-xs font-bold tracking-widest text-secondary uppercase">Find Us</h4>
                    <p className="text-sm text-ink/65 leading-relaxed">Auto Bhan Road, Latifabad, Hyderabad, Sindh</p>
                    <p className="text-sm text-ink/65">reservations@brohirestaurant.pk</p>
                    <div className="flex gap-4 mt-2">
                        {socialLinks.map(({ icon: Icon, href }, index) => (
                            <a
                                key={index}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-ink/60 hover:text-secondary transition-colors"
                                aria-label="social link"
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 mt-14 pt-6 border-t border-outline-variant/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-ink/50">© 2026 Brohi Restaurant, Hyderabad. All rights reserved.</p>

                <div className="flex gap-6">
                    {bottomLinks.map((link) => (
                        <Link key={link.label} to={link.path} className="text-xs text-ink/55 hover:text-secondary">
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

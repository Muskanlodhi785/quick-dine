import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
            <p className="text-[11px] font-semibold tracking-[0.4em] uppercase text-secondary">404 — Lost table</p>
            <h1 className="font-display text-6xl md:text-7xl text-primary mt-4 italic">Page not found</h1>
            <p className="text-ink/55 text-sm mt-5 max-w-md leading-relaxed">
                The page you are looking for has been cleared from the menu. Let us seat you somewhere wonderful instead.
            </p>
            <Link
                to="/"
                className="mt-8 bg-secondary text-on-secondary text-xs font-bold tracking-widest uppercase px-7 py-3.5 rounded-lg hover:brightness-110 transition-all cursor-pointer"
            >
                Back to Discover
            </Link>
        </div>
    );
}

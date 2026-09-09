interface BrandProps {
    /** Scale the mark up/down, e.g. "text-2xl" (default) or "text-3xl". */
    size?: string;
    className?: string;
}

/** Brohi Restaurant wordmark — Fraunces serif + Ajrak-maroon dot. */
export default function Brand({ size = "text-2xl", className = "" }: BrandProps) {
    return (
        <span className={`inline-flex items-center select-none ${className}`}>
            <span className={`font-display font-semibold tracking-tight text-primary leading-none ${size}`}>
                Brohi
            </span>
            <span className={`text-secondary leading-none mx-[3px] ${size}`}>•</span>
            <span className="hidden sm:inline-flex flex-col justify-center leading-none gap-[3px]">
                <span className="text-[8px] font-bold tracking-[0.32em] uppercase text-secondary">Restaurant</span>
                <span className="text-[8px] font-semibold tracking-[0.3em] uppercase text-ink/45">Hyderabad</span>
            </span>
        </span>
    );
}

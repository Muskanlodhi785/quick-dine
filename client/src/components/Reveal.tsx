import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface RevealProps {
    children: ReactNode;
    /** Stagger delay in ms */
    delay?: number;
    className?: string;
    as?: ElementType;
}

/** Fade-up on scroll into view (IntersectionObserver). */
export default function Reveal({ children, delay = 0, className = "", as = "div" }: RevealProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const Tag = as;
    return (
        <Tag
            ref={ref}
            className={`reveal ${visible ? "is-visible" : ""} ${className}`}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </Tag>
    );
}

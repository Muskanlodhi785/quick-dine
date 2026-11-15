/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Hero from "../components/home/Hero.tsx";
import CuisineBrowse from "../components/home/CuisineBrowse.tsx";
import TrendingRow from "../components/home/TrendingRow.tsx";
import MembershipSection from "../components/home/MembershipSection.tsx";
import NewsletterCTA from "../components/home/NewsletterCTA.tsx";
import MarqueeStrip from "../components/home/MarqueeStrip.tsx";
import AiPicks from "../components/home/AiPicks.tsx";
import Reveal from "../components/Reveal.tsx";
import toast from "react-hot-toast";
import api from "../lib/api.ts";


export default function Home() {
    const [trending, setTrending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try{
               const res = await api.get("/restaurant/featured");
                setTrending(res.data);
            }
catch (error: any) {
  console.log("Restaurant Error:", error);
  console.log("Status:", error.response?.status);
  console.log("Data:", error.response?.data);

  toast.error(error.response?.data?.message || error.message);
}
            finally{
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    return (
        <div className="min-h-screen bg-surface flex flex-col pt-0">

            <main className="flex-1">
                <Hero />
                <MarqueeStrip />
                <Reveal>
                    <CuisineBrowse />
                </Reveal>
                <Reveal delay={80}>
                    <TrendingRow trending={trending} loading={loading} />
                </Reveal>
                <Reveal delay={100}>
                    <AiPicks />
                </Reveal>
                <Reveal delay={120}>
                    <MembershipSection />
                </Reveal>
                <NewsletterCTA />
            </main>

        </div>
    );
}

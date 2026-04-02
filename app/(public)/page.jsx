'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

import MarketplaceOverview from "@/components/MarketplaceOverview";
import ProcessWorkflow from "@/components/ProcessWorkflow";
import BankVerificationDemo from "@/components/BankVerificationDemo";

export default function Home() {
    return (
        <div>
            <Hero />
            <BankVerificationDemo />
            <MarketplaceOverview />
            <LatestProducts />
            <ProcessWorkflow />
            <OurSpecs />
            <BestSelling />
        </div>
    );
}

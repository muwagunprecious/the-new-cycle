'use client'
import HeroSlider from "@/components/HeroSlider";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

import MarketplaceOverview from "@/components/MarketplaceOverview";
import CategoriesMarquee from "@/components/CategoriesMarquee";

export default function Home() {
    return (
        <div className="bg-white">
            <HeroSlider />
            
            {/* Quick Categories Ribbon (Optional but fits Jumia style) */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
               <CategoriesMarquee />
            </div>

            {/* Marketplace Grid Direct Follow Up */}
            <div className="bg-slate-50 border-t border-slate-100 py-10">
                <LatestProducts />
            </div>
            
            <div className="space-y-24 py-16">
                <MarketplaceOverview />
                <OurSpecs />
            </div>
        </div>
    );
}

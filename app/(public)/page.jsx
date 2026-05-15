import HeroSlider from "@/components/HeroSlider";
import DashboardsShowcase from "@/components/DashboardsShowcase";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import MarketplaceOverview from "@/components/MarketplaceOverview";
import NetworkOverview from "@/components/NetworkOverview";
import CategoriesMarquee from "@/components/CategoriesMarquee";
import { getAllProducts } from "@/backend-actions/actions/product";

export const revalidate = 60 // ISR caching every 60 seconds

export default async function Home() {
    const result = await getAllProducts();
    const initialProducts = result.success ? result.products : [];

    return (
        <div className="bg-white">
            <HeroSlider />
            <DashboardsShowcase />
            <CategoriesMarquee />
            <LatestProducts initialProducts={initialProducts} />
            <NetworkOverview />
            <MarketplaceOverview />
            <OurSpecs />
        </div>
    );
}

import HeroSlider from "@/components/HeroSlider";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";
import MarketplaceOverview from "@/components/MarketplaceOverview";
import CategoriesMarquee from "@/components/CategoriesMarquee";
import { getAllProducts } from "@/backend-actions/actions/product";

export const revalidate = 60 // ISR caching every 60 seconds

export default async function Home() {
    const result = await getAllProducts();
    const initialProducts = result.success ? result.products : [];

    return (
        <div className="bg-white">
            <HeroSlider />
            <CategoriesMarquee />
            <LatestProducts initialProducts={initialProducts} />
            <MarketplaceOverview />
            <OurSpecs />
        </div>
    );
}

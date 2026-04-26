import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import GlobalLoader from "@/components/GlobalLoader";
import "./globals.css";

export const metadata = {
    title: {
        default: "GoCycle | Africa's Leading Battery Recycling & Eco-Marketplace",
        template: "%s | GoCycle Africa"
    },
    description: "GoCycle is Africa's premier platform for battery recycling and sustainable energy. Buy, sell, and recycle verified used batteries safely. Join the circular economy movement in Nigeria.",
    keywords: ["battery recycling Africa", "used batteries Nigeria", "sustainable energy Lagos", "GoCycle", "e-waste recycling Africa", "solar batteries Nigeria", "inverter batteries Lagos"],
    authors: [{ name: "GoCycle Team" }],
    creator: "GoCycle",
    publisher: "GoCycle Africa",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_NG",
        url: "https://gocycle.ng",
        title: "GoCycle | Africa's Leading Battery Recycling & Eco-Marketplace",
        description: "Join the revolution of battery recycling in Africa. Buy and sell verified batteries on GoCycle.",
        siteName: "GoCycle Africa",
    },
    twitter: {
        card: "summary_large_image",
        title: "GoCycle | Battery Recycling in Africa",
        description: "Africa's #1 marketplace for sustainable battery recycling. Buy and sell verified batteries.",
        creator: "@GoCycleAfrica",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>
                <StoreProvider>
                    <div suppressHydrationWarning>
                        <Toaster />
                    </div>
                    <GlobalLoader />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}

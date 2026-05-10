import Script from "next/script";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import RealTimeNotifications from "@/components/notifications/RealTimeNotifications";
import GlobalLoader from "@/components/GlobalLoader";
import PerformanceTracker from "@/components/PerformanceTracker";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    display: "swap",
});

export const metadata = {
    title: {
        default: "GoCycle.ng | Best Battery Recycling in Lagos, Nigeria",
        template: "%s | GoCycle.ng"
    },
    description: "GoCycle.ng is Lagos' leading platform for battery recycling and sustainable energy solutions. We help individuals and businesses in Nigeria safely recycle used batteries while earning value. Join our circular economy movement in Lagos today.",
    keywords: ["battery recycling Lagos", "used battery disposal Nigeria", "recycle batteries Lagos", "GoCycle.ng", "e-waste recycling Lagos", "solar battery recycling Nigeria", "inverter battery recycling Lagos"],
    authors: [{ name: "GoCycle.ng Team" }],
    creator: "GoCycle.ng",
    publisher: "GoCycle.ng",
    alternates: {
        canonical: "https://gocycle.ng",
    },
    openGraph: {
        type: "website",
        locale: "en_NG",
        url: "https://gocycle.ng",
        title: "GoCycle.ng | Leading Battery Recycling & Eco-Marketplace in Lagos",
        description: "Join the revolution of battery recycling in Lagos, Nigeria. Safely recycle and trade verified batteries on GoCycle.ng.",
        siteName: "GoCycle.ng",
    },
    twitter: {
        card: "summary_large_image",
        title: "GoCycle.ng | Battery Recycling in Lagos, Nigeria",
        description: "Nigeria's #1 marketplace for sustainable battery recycling. Recycle your batteries in Lagos with GoCycle.ng.",
        creator: "@GoCycleNG",
    },
    verification: {
        google: 'google2801bcae551181ea',
    },
};

export default function RootLayout({ children }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GoCycle.ng",
        "url": "https://gocycle.ng",
        "description": "Nigeria's #1 Battery Recycling Marketplace",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://gocycle.ng/shop?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "GoCycle.ng",
        "url": "https://gocycle.ng",
        "logo": "https://gocycle.ng/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-XXX-XXXX",
            "contactType": "customer service"
        }
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script
                    id="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Script
                    id="org-json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                />
            </head>
            <body className={`${outfit.className} antialiased`} suppressHydrationWarning>
                <StoreProvider>
                    <div suppressHydrationWarning>
                        <Toaster />
                    </div>
                    <GlobalLoader />
                    <PerformanceTracker />
                    <RealTimeNotifications />
                    {children}
                </StoreProvider>
            </body>
        </html>
    );
}

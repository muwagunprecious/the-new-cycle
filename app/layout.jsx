import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import GlobalLoader from "@/components/GlobalLoader";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata = {
    title: "GoCycle | Sustainable Battery Marketplace",
    description: "Buy and sell verified used batteries. Join the circular economy in Lagos.",
};


export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${outfit.className} antialiased`} suppressHydrationWarning>
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

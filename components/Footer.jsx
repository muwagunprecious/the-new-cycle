import Link from "next/link";
import { LeafIcon, MailIcon, PhoneIcon, MapPinIcon, FacebookIcon, InstagramIcon, TwitterIcon, LinkedinIcon, ArrowUpRightIcon } from "lucide-react";

const Footer = () => {

    const footerLinks = [
        {
            title: "Marketplace",
            links: [
                { text: "Solar Batteries", path: '/shop?category=Solar' },
                { text: "Inverter Systems", path: '/shop?category=Inverter' },
                { text: "Automotive Power", path: '/shop?category=Car' },
                { text: "Recycling Center", path: '/recycling' },
            ]
        },
        {
            title: "Network",
            links: [
                { text: "Become a Merchant", path: '/signup?role=SELLER' },
                { text: "Logistics Partners", path: '/partners' },
                { text: "Sustainability Report", path: '/impact' },
                { text: "API Documentation", path: '/docs' },
            ]
        },
        {
            title: "Support",
            links: [
                { text: "Help Center", path: '/help' },
                { text: "Trust & Safety", path: '/safety' },
                { text: "Terms of Service", path: '/terms' },
                { text: "Privacy Policy", path: '/privacy' },
            ]
        }
    ];

    const socialIcons = [
        { icon: FacebookIcon, link: "#" },
        { icon: InstagramIcon, link: "#" },
        { icon: TwitterIcon, link: "#" },
        { icon: LinkedinIcon, link: "#" },
    ]

    return (
        <footer className="bg-slate-900 pt-20 pb-10 mt-20 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-60 -mt-60"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-xl shadow-emerald-500/20">
                                <LeafIcon className="text-white" size={24} />
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">Go<span className="text-emerald-500">Cycle</span></span>
                        </div>

                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                            Building Nigeria's most trusted ecosystem for battery recycling and circular energy. Empowing merchants, protecting the environment.
                        </p>

                        <div className="flex items-center gap-4">
                            {socialIcons.map((item, i) => (
                                <Link
                                    href={item.link}
                                    key={i}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all group"
                                >
                                    <item.icon size={18} />
                                </Link>
                            ))}
                        </div>

                        <div className="pt-8 space-y-4">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-50">Join Newsletter</h3>
                            <div className='flex bg-white/5 backdrop-blur-md text-sm p-1 rounded-2xl w-full max-w-sm border border-white/10 focus-within:border-emerald-500/50 transition-all'>
                                <input className='flex-1 bg-transparent pl-4 outline-none text-white placeholder:text-slate-500 font-medium' type="text" placeholder='Enter your email' />
                                <button className='font-black text-[10px] uppercase tracking-widest bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20'>
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">Get exclusive deals and eco-updates.</p>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
                        {footerLinks.map((section, idx) => (
                            <div key={idx} className="space-y-6">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-50">{section.title}</h3>
                                <ul className="space-y-4">
                                    {section.links.map((link, i) => (
                                        <li key={i}>
                                            <Link href={link.path} className="text-slate-400 hover:text-emerald-400 text-[13px] font-medium transition-colors flex items-center gap-1 group">
                                                {link.text}
                                                <ArrowUpRightIcon size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                            <MailIcon size={14} /> contact@gocycle.ng
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                            <MapPinIcon size={14} /> Lagos, Nigeria
                        </div>
                    </div>

                    <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.1em]">
                        © 2026 GoCycle Energy. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
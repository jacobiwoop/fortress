import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Globe, ArrowRight, TrendingUp, Users, Building2, ChevronRight, Menu, X, Languages } from 'lucide-react';
// @ts-ignore
import heroBg from './asset/Home Page Hero Image.jpg.transform.rbistage.jpg';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    // Make config reactive so logo/name updates appear immediately
    const [config, setConfig] = useState(store.getConfig());
    const [lang, setLang] = useState(store.getLanguage());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    useEffect(() => {
        const unsub = store.subscribe(() => {
            setLang(store.getLanguage());
            setConfig(store.getConfig());
        });

        // Check for inscription-mail parameter
        const params = new URLSearchParams(window.location.search);
        const inscriptionMail = params.get('inscription-mail');
        
        if (inscriptionMail) {
            navigate(`/register?inscription-mail=${encodeURIComponent(inscriptionMail)}`);
        }

        return unsub;
    }, []);

    const changeLang = (l: string) => {
        store.setLanguage(l as any);
        setLangMenuOpen(false);
    };

    return (
        <div className="font-sans antialiased bg-white text-black">
            {/* Top Bar for Business/Private/Investors - like RBI */}
            <div className="bg-brand-black text-white text-xs py-2 px-4 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto flex justify-end gap-6 uppercase tracking-wider font-semibold">
                    <a href="#" className="hover:text-brand-yellow transition-colors">{store.t('land.top.private')}</a>
                    <a href="#" className="hover:text-brand-yellow transition-colors">{store.t('land.top.corp')}</a>
                    <a href="#" className="hover:text-brand-yellow transition-colors">{store.t('land.top.investors')}</a>
                    <a href="#" className="hover:text-brand-yellow transition-colors">{store.t('land.top.press')}</a>
                    <a href="#" className="hover:text-brand-yellow transition-colors">{store.t('land.top.careers')}</a>
                </div>
            </div>

            {/* Main Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-yellow w-10 h-10 flex items-center justify-center font-bold text-xl text-black">
                            {config.logoUrl ? <img src={config.logoUrl} alt="" className="w-8 h-8 object-contain" /> : config.logoText}
                        </div>
                        <span className="text-xl font-bold tracking-tight uppercase border-l-2 border-brand-yellow pl-3 text-black">
                            {config.name}
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8 font-bold text-sm tracking-wide">
                        <NavDropdown title={store.t('land.nav.about')} items={["Mission", "History", "Organization"]} />
                        <NavDropdown title={store.t('land.nav.sus')} items={["Strategy", "Reports", "ESG"]} />
                        <NavDropdown title={store.t('land.nav.net')} items={["CEE Region", "Global Presence"]} />
                        
                        <div className="h-6 w-px bg-zinc-300 mx-2"></div>

                        {/* Language Selector */}
                        <div className="relative">
                            <button 
                                onClick={() => setLangMenuOpen(!langMenuOpen)}
                                className="flex items-center gap-2 text-xs font-bold text-black border border-black rounded px-3 py-2 cursor-pointer hover:bg-black hover:text-white transition-colors uppercase"
                            >
                                <Languages size={14} />
                                {lang}
                                <ChevronRight size={12} className={`transition-transform duration-200 ${langMenuOpen ? 'rotate-90' : ''}`} />
                            </button>
                            
                            {langMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-24 bg-white border border-zinc-200 shadow-xl rounded py-1 z-50">
                                    {['en', 'fr', 'de', 'pt'].map((l) => (
                                        <div 
                                            key={l}
                                            onClick={() => changeLang(l)}
                                            className={`px-4 py-2 text-sm font-bold uppercase cursor-pointer hover:bg-brand-yellow hover:text-black transition-colors ${lang === l ? 'bg-zinc-100' : ''}`}
                                        >
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-brand-yellow text-black px-6 py-3 font-bold hover:bg-yellow-400 ease-in-out duration-300 flex items-center gap-2 group"
                        >
                            {store.t('land.nav.login')}
                            <div className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-sm group-hover:bg-white group-hover:text-black transition-colors">
                                <ArrowRight size={14} />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 p-4 flex flex-col gap-4 shadow-xl">
                        <a href="#" className="font-bold text-lg p-2 border-b border-zinc-100">{store.t('land.nav.about')}</a>
                        <a href="#" className="font-bold text-lg p-2 border-b border-zinc-100">{store.t('land.nav.sus')}</a>
                        <a href="#" className="font-bold text-lg p-2 border-b border-zinc-100">{store.t('land.nav.net')}</a>
                        
                        {/* Mobile Language Selector */}
                        <div className="flex gap-4 p-2 border-b border-zinc-100">
                            {['en', 'fr', 'de', 'pt'].map((l) => (
                                <button 
                                    key={l}
                                    onClick={() => { changeLang(l); setMobileMenuOpen(false); }}
                                    className={`text-sm font-bold uppercase w-10 h-10 rounded flex items-center justify-center border ${lang === l ? 'bg-black text-white border-black' : 'bg-white text-black border-zinc-300'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-brand-yellow text-black px-6 py-3 font-bold w-full text-left"
                        >
                            {store.t('land.nav.login')}
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section - Split Layout */}
            <div className="relative bg-zinc-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                    {/* Left Content */}
                    <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20 bg-white lg:bg-transparent z-10">
                        <div className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tighter mb-8 text-black whitespace-pre-line">
                           {store.t('land.hero.title')}
                        </div>
                        <p className="text-xl text-zinc-600 mb-10 max-w-md leading-relaxed">
                            {store.t('land.hero.subtitle').replace('{name}', config.name)}
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/login')} className="bg-brand-black text-white px-8 py-4 font-bold flex items-center gap-3 hover:bg-zinc-800 transition-colors group">
                                {store.t('land.hero.open')}
                                <ChevronRight className="text-brand-yellow group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="border-2 border-black text-black px-8 py-4 font-bold hover:bg-black hover:text-white transition-colors">
                                {store.t('land.hero.contact')}
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Hero Image */}
                    <div className="relative flex items-center justify-center overflow-hidden min-h-[300px] lg:h-full">
                        <img 
                            src={heroBg}
                            alt="Hero Background" 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* About RBI Group Section */}
            <section className="py-24 px-6 bg-brand-beige">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold mb-12 text-zinc-800">{store.t('land.about.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ImageCard 
                            image="https://picsum.photos/800/600?random=1"
                            title={store.t('land.about.us_title')}
                            desc={store.t('land.about.us_desc').replace('{name}', config.name)}
                        />
                        <ImageCard 
                            image="https://picsum.photos/800/600?random=2"
                            title={store.t('land.about.net_title')}
                            desc={store.t('land.about.net_desc')}
                        />
                        <ImageCard 
                            image="https://picsum.photos/800/600?random=3"
                            title={store.t('land.about.sus_title')}
                            desc={store.t('land.about.sus_desc')}
                        />
                    </div>
                </div>
            </section>

             {/* Investor Relations Section */}
             <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6 text-zinc-900">{store.t('land.inv.title')}</h2>
                        <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                            {store.t('land.inv.text')}
                        </p>
                        <button className="bg-brand-yellow text-black px-8 py-4 font-bold rounded-sm hover:bg-yellow-400 transition-colors">
                            {store.t('land.inv.btn')}
                        </button>
                    </div>
                     <div className="bg-zinc-100 p-8 rounded-lg">
                        <img 
                            src="https://picsum.photos/800/800?random=4" 
                            alt="Investor Relations" 
                            className="w-full h-auto object-cover rounded shadow-sm grayscale hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                </div>
            </section>

             {/* Ad hoc Releases Section */}
             <section className="py-24 px-6 bg-white border-t border-zinc-100">
                <div className="max-w-7xl mx-auto">
                     <h2 className="text-2xl font-bold mb-8 text-zinc-800 border-b border-zinc-200 pb-4">{store.t('land.news.title')}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <NewsCard 
                            date="2025-12-17 (17:33 CET)"
                            title="Michael Höllerer will succeed Johann Strobl as CEO of RBI on 1 July 2026"
                            desc="The Supervisory Board of Raiffeisen Bank International AG (RBI) has today appointed Michael Höllerer as Johann Strobl's successor as CEO."
                            image="https://picsum.photos/seed/news1/800/600?blur=2"
                        />
                        <NewsCard 
                            date="15.10.2025 (19:00 CET)"
                            title="RBI appoints Kamila Makhmudová as CFO to the Management Board"
                            desc="Today, the Supervisory Board of Raiffeisen Bank International AG (RBI) has appointed Kamila Makhmudová as CFO with effect from 1 January."
                            image="https://picsum.photos/seed/news2/800/600?blur=2"
                        />
                        <NewsCard 
                            date="2025-07-24 (18:56 CET)"
                            title="Raiffeisenbank derecognizes EUR 1.2 billion of expected proceeds"
                            desc="Adjusted risk assessment by RBI's Management Board leads to derecognition of the expected proceeds from enforcement."
                            image="https://picsum.photos/seed/news3/800/600?blur=2"
                        />
                     </div>
                </div>
            </section>


            {/* Careers Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2">
                 <div className="h-96 lg:h-auto overflow-hidden relative">
                    <img 
                        src="https://picsum.photos/id/1015/1200/800" 
                        alt="Careers" 
                        className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 hover:scale-105"
                    />
                 </div>
                 <div className="bg-brand-beige p-12 lg:p-24 flex flex-col justify-center">
                     <h2 className="text-4xl font-bold mb-6 text-zinc-900 leading-tight">{store.t('land.careers.title')}</h2>
                     <p className="text-zinc-600 mb-8 leading-relaxed max-w-lg">
                         {store.t('land.careers.text').replace('{name}', config.name)}
                     </p>
                     <button className="border border-black text-black px-8 py-3 font-bold w-max hover:bg-black hover:text-white transition-colors">
                         {store.t('land.careers.btn')}
                     </button>
                 </div>
            </section>

             {/* Footer - RBI Style */}
             <footer className="bg-zinc-900 text-white pt-20 pb-10">
                 <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                     <div>
                         <h4 className="border-b-2 border-brand-yellow pb-2 mb-6 font-bold uppercase tracking-wider text-sm text-brand-yellow">{store.t('land.footer.contact')}</h4>
                         <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                             {config.name} Head Office<br/>
                             Am Stadtpark 9<br/>
                             1030 Vienna, Austria
                         </p>
                         <p className="text-zinc-400 text-sm hover:text-brand-yellow cursor-pointer transition-colors">+43 1 71707-0</p>
                         <p className="text-zinc-400 text-sm hover:text-brand-yellow cursor-pointer transition-colors">contact@{config.name.toLowerCase().replace(/\s/g, '')}.com</p>
                     </div>

                     <div>
                         <h4 className="border-b-2 border-brand-yellow pb-2 mb-6 font-bold uppercase tracking-wider text-sm text-brand-yellow">{store.t('land.nav.about')}</h4>
                         <ul className="space-y-3 text-sm text-zinc-400">
                             <li><a href="#" className="hover:text-white">Mission & Values</a></li>
                             <li><a href="#" className="hover:text-white">Organization</a></li>
                             <li><a href="#" className="hover:text-white">History</a></li>
                             <li><a href="#" className="hover:text-white">Compliance</a></li>
                         </ul>
                     </div>

                     <div>
                         <h4 className="border-b-2 border-brand-yellow pb-2 mb-6 font-bold uppercase tracking-wider text-sm text-brand-yellow">{store.t('land.top.investors')}</h4>
                         <ul className="space-y-3 text-sm text-zinc-400">
                             <li><a href="#" className="hover:text-white">Shares</a></li>
                             <li><a href="#" className="hover:text-white">Reports</a></li>
                             <li><a href="#" className="hover:text-white">Financial Calendar</a></li>
                             <li><a href="#" className="hover:text-white">Ratings</a></li>
                         </ul>
                     </div>

                     <div>
                         <h4 className="border-b-2 border-brand-yellow pb-2 mb-6 font-bold uppercase tracking-wider text-sm text-brand-yellow">Follow Us</h4>
                         <div className="flex gap-4">
                             <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors cursor-pointer">In</div>
                             <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors cursor-pointer">Fb</div>
                             <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center hover:bg-brand-yellow hover:text-black transition-colors cursor-pointer">X</div>
                         </div>
                     </div>
                 </div>

                 <div className="max-w-7xl mx-auto px-6 border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500 uppercase tracking-widest">
                     <div>
                         &copy; {new Date().getFullYear()} {config.name} AG. {store.t('land.footer.rights')}
                     </div>
                     <div className="flex gap-6 mt-4 md:mt-0">
                         <a href="#" className="hover:text-white">{store.t('land.footer.imprint')}</a>
                         <a href="#" className="hover:text-white">{store.t('land.footer.legal')}</a>
                         <a href="#" className="hover:text-white">{store.t('land.footer.privacy')}</a>
                         <a href="#" className="hover:text-white">{store.t('land.footer.cookies')}</a>
                     </div>
                 </div>
             </footer>
        </div>
    );
};

// Components

const NavDropdown = ({ title, items }: { title: string, items: string[] }) => (
    <div className="relative group cursor-pointer h-20 flex items-center">
        <span className="group-hover:text-brand-yellow transition-colors flex items-center gap-1">
            {title.toUpperCase()}
        </span>
        <div className="absolute top-full left-0 w-48 bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border-t-2 border-brand-yellow z-50">
            {items.map(item => (
                <div key={item} className="px-6 py-3 hover:bg-zinc-50 text-black font-medium text-sm border-b border-zinc-100 last:border-none">
                    {item}
                </div>
            ))}
        </div>
    </div>
);

const ImageCard = ({ image, title, desc }: { image: string, title: string, desc: string }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group cursor-pointer h-full flex flex-col">
        <div className="h-48 overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-bold mb-4 text-zinc-900">{title}</h3>
            <p className="text-zinc-600 mb-8 leading-relaxed flex-1">{desc}</p>
            <div className="font-bold text-teal-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <ChevronRight size={16} />
            </div>
        </div>
    </div>
);

const NewsCard = ({ date, title, desc, image }: { date: string, title: string, desc: string, image: string }) => (
    <div className="bg-brand-beige group cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
         <div className="h-40 overflow-hidden relative">
             <div className="absolute inset-0 bg-brand-yellow w-full h-full transform -skew-x-12 scale-150 origin-bottom-left z-0 opacity-20 group-hover:opacity-30 transition-opacity"></div>
             <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply grayscale" />
         </div>
         <div className="p-8 flex-1 flex flex-col bg-brand-beige relative z-10">
             <div className="text-xs font-bold text-zinc-500 mb-3">{date}</div>
             <h4 className="font-bold text-lg mb-4 leading-tight group-hover:text-brand-black/70 transition-colors">{title}</h4>
             <p className="text-sm text-zinc-600 leading-relaxed mb-4 flex-1">{desc}</p>
         </div>
    </div>
);
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { ArrowRight, Menu, X, ChevronDown, Check, Star, Shield, Smartphone, Zap } from 'lucide-react';

export const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(store.getConfig());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        return store.subscribe(() => setConfig(store.getConfig()));
    }, []);

    const features = [
        {
            title: "Buy & sell in minutes",
            desc: "Easiest way to buy and sell bitcoin in Canada. Account set up is lightning fast.",
            icon: <Zap className="text-brand-blue" size={32} />
        },
        {
            title: "Commission-free",
            desc: "We don't charge commission fees for buying or selling digital currency.",
            icon: <Star className="text-brand-blue" size={32} />
        },
        {
            title: "Secure & Regulated",
            desc: "We are a registered Money Service Business with FINTRAC and Revenu Québec.",
            icon: <Shield className="text-brand-blue" size={32} />
        },
        {
            title: "Responsive Support",
            desc: "Our support team is available every day to help you with your questions.",
            icon: <Smartphone className="text-brand-blue" size={32} />
        }
    ];

    return (
        <div className="font-sans antialiased bg-white text-brand-navy selection:bg-brand-blue selection:text-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="text-brand-blue font-extrabold text-2xl tracking-tighter flex items-center gap-1">
                            {config.logoUrl ? (
                                <img src={config.logoUrl} alt="Logo" className="h-8 w-auto" />
                            ) : (
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-brand-blue">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-2 1L12 15.5l7-3.5-2-1-5 2.5z"/>
                                </svg>
                            )}
                            <span>{config.name || 'shakepay'}</span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8 font-semibold text-brand-navy">
                        <a href="#" className="hover:text-brand-blue transition-colors">Features</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Security</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Fees</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Careers</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Blog</a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/login')}
                            className="font-bold hover:text-brand-blue transition-colors"
                        >
                            Log in
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-brand-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                        >
                            Get started
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-20 bg-white z-40 p-6 flex flex-col gap-6 animate-fade-in-down">
                        <a href="#" className="text-2xl font-bold">Features</a>
                        <a href="#" className="text-2xl font-bold">Security</a>
                        <a href="#" className="text-2xl font-bold">Fees</a>
                        <hr className="border-gray-100" />
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-xl font-bold text-left"
                        >
                            Log in
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className="bg-brand-blue text-white px-6 py-4 rounded-full font-bold text-xl text-center"
                        >
                            Get started
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="relative pt-16 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="z-10">
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-brand-navy">
                            Buy and earn bitcoin <span className="text-brand-blue">the easy way.</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
                            Buy and sell bitcoin in minutes with Interac e-Transfer®. Cash out to your bank account instantly.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button 
                                onClick={() => navigate('/register')}
                                className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-blue/20"
                            >
                                Get started
                            </button>
                            <div className="flex items-center gap-4 px-4 text-gray-400">
                                <span>available on</span>
                                <div className="flex gap-2">
                                    <Smartphone className="w-6 h-6" />
                                    <span>iOS & Android</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[600px] hidden lg:block">
                         {/* Abstract Blue Shapes/Blob */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                         
                         {/* Placeholder for Phone Mockup */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-brand-navy rounded-[40px] border-8 border-white shadow-2xl overflow-hidden flex flex-col items-center pt-10">
                             <div className="w-1/2 h-6 bg-black rounded-full mb-8"></div>
                             
                             <div className="w-full h-full bg-white rounded-t-[30px] p-6 space-y-6">
                                 <div className="flex justify-between items-center">
                                     <div className="font-bold text-lg">My Portfolio</div>
                                     <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                 </div>
                                 <div className="space-y-1">
                                    <div className="text-sm text-gray-500">Total Balance</div>
                                    <div className="text-4xl font-extrabold">$12,450.00</div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-brand-light p-4 rounded-2xl">
                                         <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue mb-2">
                                            $
                                         </div>
                                         <div className="font-bold">Dollars</div>
                                         <div className="text-sm text-gray-500">$500.00</div>
                                     </div>
                                      <div className="bg-brand-light p-4 rounded-2xl">
                                         <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-2">
                                            B
                                         </div>
                                         <div className="font-bold">Bitcoin</div>
                                         <div className="text-sm text-gray-500">0.45 BTC</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </header>

            {/* Social Proof */}
            <section className="py-12 border-y border-gray-100 bg-brand-light/30">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">As seen on</p>
                    <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-40 grayscale">
                        {/* Simple Text Placeholders for Logos */}
                        <span className="text-2xl font-bold font-serif">Bloomberg</span>
                        <span className="text-2xl font-bold font-serif italic">Forbes</span>
                        <span className="text-2xl font-bold">Financial Post</span>
                        <span className="text-2xl font-bold font-serif">BetaKit</span>
                        <span className="text-2xl font-bold">CBC</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-brand-light/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-16">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-brand-navy mb-6">
                            Invest in bitcoin the Canadian way.
                        </h2>
                        <p className="text-xl text-gray-500">
                           {config.name} allows Canadians to buy and sell bitcoin easily.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-shadow duration-300">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-lg text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Blue CTA Section */}
             <section className="py-24 bg-brand-blue text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                     <div>
                         <h2 className="text-4xl lg:text-5xl font-extrabold mb-8">
                             Get paid in bitcoin.
                         </h2>
                         <p className="text-xl mb-10 text-white/90 leading-relaxed">
                             Set up a direct deposit to your {config.name} account and get a portion of your paycheque in bitcoin automatically.
                         </p>
                         <button className="bg-white text-brand-blue px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
                             Learn more about Direct Deposit
                         </button>
                     </div>
                     <div className="bg-white/10 rounded-[40px] p-8 backdrop-blur-sm border border-white/20">
                         {/* Mockup */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-blue font-bold text-xl">
                                $
                            </div>
                            <div>
                                <div className="font-bold text-lg">Paycheque received</div>
                                <div className="text-white/70 text-sm">Just now</div>
                            </div>
                        </div>
                        <div className="text-4xl font-bold mb-2">+$2,450.00</div>
                        <div className="text-white/70">Direct Deposit from EMPLOYER INC</div>
                     </div>
                </div>
            </section>

            {/* Testimonial / Bottom CTA */}
            <section className="py-32 text-center bg-white">
                 <div className="max-w-4xl mx-auto px-6">
                     <h2 className="text-4xl lg:text-6xl font-extrabold mb-10 text-brand-navy">
                         Join over 1 million Canadians using {config.name} today.
                     </h2>
                     <button 
                        onClick={() => navigate('/register')}
                        className="bg-brand-blue text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-500 hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-blue/30"
                    >
                        Create account
                    </button>
                 </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-20 text-sm md:text-base">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="text-brand-blue font-extrabold text-xl tracking-tighter">
                                {config.name || 'shakepay'}
                            </div>
                        </div>
                        <p className="text-gray-500 mb-6 max-w-xs">
                            The easiest way for Canadians to buy and sell bitcoin and pay their friends.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center cursor-pointer">X</div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center cursor-pointer">In</div>
                            <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center cursor-pointer">Ig</div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-navy mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#" className="hover:text-brand-blue">Buy & Sell</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Shakepay Card</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Direct Deposit</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-navy mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#" className="hover:text-brand-blue">About</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Careers</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Blog</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Press</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-navy mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#" className="hover:text-brand-blue">Terms</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Privacy</a></li>
                            <li><a href="#" className="hover:text-brand-blue">Security</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-gray-100 text-gray-400 text-xs">
                    <p>&copy; {new Date().getFullYear()} {config.name} Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
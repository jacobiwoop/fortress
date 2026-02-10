import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../services/store';
import { Mail, Github, Linkedin, ArrowRight, ShieldCheck, ChevronLeft } from 'lucide-react';

export const RegisterSelection: React.FC = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(store.getConfig());

    useEffect(() => {
        const unsub = store.subscribe(() => {
            setConfig(store.getConfig());
        });
        return unsub;
    }, []);

    const handleSocialLogin = (provider: string) => {
        // Placeholder for social login logic
        console.log(`Login with ${provider}`);
        // For now, we can redirect to register or just alert
        alert(`${provider} login coming soon! Please use email for now.`);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-black">
            {/* Simple Header */}
            <div className="border-b border-zinc-100 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-brand-yellow w-10 h-10 flex items-center justify-center font-bold text-xl text-black rounded-sm">
                         {config.logoUrl ? <img src={config.logoUrl} alt="" className="w-8 h-8 object-contain" /> : <ShieldCheck size={24} />}
                    </div>
                    <span className="text-xl font-bold tracking-tight uppercase border-l-2 border-brand-yellow pl-3">
                        {config.name}
                    </span>
                </div>
                <button 
                    onClick={() => navigate('/login')}
                    className="text-sm font-bold text-zinc-500 hover:text-black transition-colors"
                >
                    ALREADY HAVE AN ACCOUNT? LOGIN
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-50">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Create your account</h1>
                        <p className="text-zinc-500">Choose your preferred method to get started.</p>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => window.location.href = 'https://auth-5-epln.onrender.com'}
                            className="w-full py-4 px-6 border border-zinc-200 rounded-xl flex items-center gap-4 hover:bg-zinc-50 hover:border-zinc-300 transition-all group font-bold text-zinc-700"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                            <span className="flex-1 text-left">Continue with Google</span>
                            <ArrowRight size={20} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>

                        <button 
                            onClick={() => handleSocialLogin('GitHub')}
                            className="w-full py-4 px-6 border border-zinc-200 rounded-xl flex items-center gap-4 hover:bg-zinc-50 hover:border-zinc-300 transition-all group font-bold text-zinc-700"
                        >
                            <Github size={24} className="text-black" />
                            <span className="flex-1 text-left">Continue with GitHub</span>
                            <ArrowRight size={20} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>

                        <button 
                            onClick={() => handleSocialLogin('LinkedIn')}
                            className="w-full py-4 px-6 border border-zinc-200 rounded-xl flex items-center gap-4 hover:bg-zinc-50 hover:border-zinc-300 transition-all group font-bold text-zinc-700"
                        >
                            <Linkedin size={24} className="text-[#0077b5]" />
                            <span className="flex-1 text-left">Continue with LinkedIn</span>
                            <ArrowRight size={20} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/register')}
                            className="w-full py-4 px-6 bg-brand-yellow hover:bg-yellow-400 text-black rounded-xl flex items-center gap-4 transition-all function-bold shadow-lg shadow-yellow-500/20 group font-bold"
                        >
                            <Mail size={24} />
                            <span className="flex-1 text-left">Sign up with Email</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <p className="mt-8 text-center text-xs text-zinc-400">
                        By creating an account, you agree to our <a href="#" className="underline hover:text-black">Terms of Service</a> and <a href="#" className="underline hover:text-black">Privacy Policy</a>.
                    </p>
                </div>
                
                <button onClick={() => navigate('/')} className="mt-8 flex items-center gap-2 text-zinc-500 hover:text-black font-medium transition-colors">
                    <ChevronLeft size={16} />
                    Back to Home
                </button>
            </div>
        </div>
    );
};

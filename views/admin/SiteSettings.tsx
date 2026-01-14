import React, { useState, useEffect } from 'react';
import { store } from '../../services/store';

export const SiteSettings: React.FC = () => {
  const [config, setConfig] = useState(store.getConfig());
  const [name, setName] = useState(config.name);
  const [logoText, setLogoText] = useState(config.logoText);
  const [logoUrl, setLogoUrl] = useState<string | null>(config.logoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [lang, setLang] = useState(store.getLanguage());

  useEffect(() => {
    return store.subscribe(() => {
        setConfig(store.getConfig());
        setLang(store.getLanguage());
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let currentLogoUrl = logoUrl;

    if (file) {
      try {
        currentLogoUrl = await store.uploadLogo(file);
        setLogoUrl(currentLogoUrl);
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    await store.updateConfig(name, logoText, currentLogoUrl);
    setConfig(store.getConfig());
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">{store.t('settings.title')}</h2>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('settings.app_name')}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">{store.t('settings.logo_text')}</label>
            <input 
              type="text" 
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              maxLength={3}
              className="w-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-brand-yellow focus:outline-none uppercase"
            />
            <p className="text-xs text-zinc-500 mt-2">{store.t('settings.logo_hint')}</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-2">Logo Image</label>
             <div className="flex items-center gap-4">
                 {logoUrl && (
                     <img src={logoUrl} alt="Logo Preview" className="w-16 h-16 object-contain bg-zinc-800 rounded p-2" />
                 )}
                 <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-brand-yellow hover:file:bg-zinc-700"
                 />
             </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
             {success ? (
                 <span className="text-emerald-400 text-sm">{store.t('settings.saved')}</span>
             ) : <span></span>}
             <button type="submit" className="px-6 py-2 bg-brand-yellow text-black font-bold rounded hover:bg-yellow-400">
                 {store.t('settings.save')}
             </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-900/50 rounded-lg text-yellow-500 text-sm">
          <strong>{store.t('settings.note')}</strong> {store.t('settings.note_text')}
      </div>
    </div>
  );
};
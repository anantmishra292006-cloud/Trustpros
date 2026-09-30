import React, { useState } from 'react';
import { ShieldCheck, Database, Key, Sparkles, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { saveLocalFirebaseConfig, FirebaseConfigObject } from '../../services/firebase';

export function FirebaseSetupScreen() {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [rawJson, setRawJson] = useState('');
  const [inputMode, setInputMode] = useState<'fields' | 'json'>('fields');
  const [error, setError] = useState<string | null>(null);

  const handleJsonPaste = (text: string) => {
    setRawJson(text);
    try {
      // Try parsing JavaScript object or JSON
      const cleaned = text
        .replace(/const firebaseConfig = /g, '')
        .replace(/;/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setError(null);
    } catch {
      // Might be malformed JSON or manual text
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      setError('Please provide at least the Firebase API Key and Project ID.');
      return;
    }

    const configObj: FirebaseConfigObject = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim() || '123456789',
      appId: appId.trim() || '1:123456789:web:abcdef',
    };

    saveLocalFirebaseConfig(configObj);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">LocalVerity</h1>
              <p className="text-blue-100 text-sm">Curated Local Services Directory Platform</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-blue-100/90 leading-relaxed">
            Welcome! To start managing your community services directory, configure your Firebase project credentials.
            These can be set via <code className="bg-white/20 px-1.5 py-0.5 rounded text-xs">.env</code> variables or entered directly below.
          </p>
        </div>

        {/* Setup steps */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 inline-flex items-center justify-center font-bold">1</span>
                Create Project
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5" /></a> and create a free project.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 inline-flex items-center justify-center font-bold">2</span>
                Enable Services
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Enable <strong>Auth</strong> (Email/Password), <strong>Firestore</strong>, and <strong>Storage</strong>.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 inline-flex items-center justify-center font-bold">3</span>
                Connect App
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Register a Web App in project settings and paste credentials below.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Enter Firebase Web Credentials
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('fields')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'fields'
                      ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Form Inputs
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('json')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    inputMode === 'json'
                      ? 'bg-white dark:bg-slate-700 shadow-xs font-medium text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Paste JSON / snippet
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {inputMode === 'json' ? (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Paste `firebaseConfig` object from Firebase Console:
                </label>
                <textarea
                  value={rawJson}
                  onChange={(e) => handleJsonPaste(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-app.firebaseapp.com",\n  "projectId": "my-app",\n  "storageBucket": "my-app.appspot.com",\n  "messagingSenderId": "123456",\n  "appId": "1:123456:web:abcd"\n}`}
                  rows={6}
                  className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : null}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    API Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSyB..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      if (!authDomain) setAuthDomain(`${e.target.value}.firebaseapp.com`);
                      if (!storageBucket) setStorageBucket(`${e.target.value}.appspot.com`);
                    }}
                    placeholder="my-local-directory"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="my-app.firebaseapp.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Storage Bucket
                  </label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="my-app.appspot.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Connect & Launch Directory
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

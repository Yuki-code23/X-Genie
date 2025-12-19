"use client";

import { useState, useEffect } from "react";
import { Save, ArrowLeft, Key, User, Shield, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
    const [geminiKey, setGeminiKey] = useState("");
    const [grokKey, setGrokKey] = useState("");
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const fetchKeys = async (userId: string) => {
        const { data, error } = await supabase
            .from('user_api_keys')
            .select('provider, api_key')
            .eq('user_id', userId);

        if (data) {
            data.forEach(item => {
                if (item.provider === 'gemini') setGeminiKey(item.api_key);
                if (item.provider === 'grok') setGrokKey(item.api_key);
            });
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) await fetchKeys(user.id);
            setLoading(false);
        };
        getUser();
    }, []);

    const [testingGemini, setTestingGemini] = useState(false);

    const testGeminiKey = async () => {
        const trimmedKey = geminiKey.trim();
        if (!trimmedKey) return;
        setTestingGemini(true);
        try {
            const res = await fetch('/api/auth/test-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: trimmedKey, provider: 'gemini' })
            });
            const data = await res.json();
            if (data.success) alert('✅ Gemini APIキーは有効です！');
            else alert(`❌ 接続失敗: ${data.error}`);
        } catch (err) {
            alert('接続テスト中にエラーが発生しました');
        } finally {
            setTestingGemini(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        const providers = [
            { id: 'gemini', value: geminiKey.trim() },
            { id: 'grok', value: grokKey.trim() }
        ];

        for (const provider of providers) {
            if (provider.value) {
                // Update or Insert
                const { error } = await supabase
                    .from('user_api_keys')
                    .upsert({
                        user_id: user.id,
                        provider: provider.id,
                        api_key: provider.value
                    }, { onConflict: 'user_id,provider' });

                if (error) {
                    console.error(`Error saving ${provider.id} key:`, error);
                    alert(`${provider.id}キーの保存に失敗しました。\n詳細: ${error.message}`);
                    setLoading(false);
                    return;
                }
            } else {
                // Delete if empty
                const { error } = await supabase
                    .from('user_api_keys')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('provider', provider.id);

                if (error) {
                    console.error(`Error clearing ${provider.id} key:`, error);
                }
            }
        }

        alert('設定を保存しました');
        setLoading(false);
    };

    return (
        <main>
            <nav className="glass" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div className="container flex justify-between items-center" style={{ padding: 0 }}>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <div style={{ padding: '0.1rem', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                            <img src="/logo.png?v=2" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        </div>
                        <span className="brand-text" style={{ fontSize: '1.25rem' }}>X-Genie</span>
                        <span style={{ fontSize: '1.25rem', opacity: 0.5, margin: '0 0.5rem' }}>/</span>
                        <span style={{ fontWeight: 600, fontSize: '1.25rem', opacity: 0.8 }}>設定</span>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
                <div className="flex flex-col gap-8">
                    {/* Profile Section */}
                    <section className="card glass">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={20} color="var(--primary)" /> プロフィール情報
                        </h2>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <User size={32} color="var(--muted-foreground)" />
                                </div>
                                <div>
                                    {loading && !user ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={16} />
                                            <p className="text-muted">読み込み中...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p style={{ fontWeight: 600 }}>{user?.email?.split('@')[0] || "ユーザー"}</p>
                                            <p className="text-muted">{user?.email || "未ログイン"}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{
                                    color: '#ff4d4d',
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    height: 'auto',
                                    minHeight: 'unset'
                                }}
                            >
                                <LogOut size={16} /> ログアウト
                            </button>
                        </div>
                    </section>

                    {/* API Keys Section */}
                    <section className="card glass">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Key size={20} color="var(--primary)" /> API認証情報 (BYOK)
                        </h2>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Google Gemini APIキー</label>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>標準モデル</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Gemini APIキーを入力してください"
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        onClick={testGeminiKey}
                                        className="btn btn-secondary"
                                        disabled={testingGemini || !geminiKey}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {testingGemini ? <Loader2 className="animate-spin" size={16} /> : '接続テスト'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>xAI Grok APIキー</label>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>高度なモデル</span>
                                </div>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Grok APIキーを入力してください"
                                    value={grokKey}
                                    onChange={(e) => setGrokKey(e.target.value)}
                                />
                            </div>

                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem' }}>
                                <Shield size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: '0.875rem', color: '#93c5fd' }}>
                                    キーは利用者のブラウザセッションまたはデータベースに保存され、あなたの代わりにAIを実行するためにのみ使用されます。
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                style={{ alignSelf: 'flex-end' }}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {loading ? '保存中...' : '変更を保存'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

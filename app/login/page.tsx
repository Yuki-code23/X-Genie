"use client";

import { useState } from "react";
import { Sparkles, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) alert("ログインに失敗しました: " + error.message);
        else window.location.href = "/";
        setLoading(false);
    };

    return (
        <main className="flex items-center justify-center" style={{ minHeight: '100vh', width: '100vw' }}>
            <div className="card glass shadow-2xl" style={{ width: '90%', maxWidth: '420px', padding: '3rem' }}>
                <div className="flex flex-col items-center gap-4" style={{ marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '1rem' }}>
                        <Sparkles size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>X-Genie ログイン</h1>
                    <p className="text-muted">資格情報を入力して続行してください</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>メールアドレス</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>パスワード</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', padding: '0.75rem' }}
                        disabled={loading}
                    >
                        {loading ? "サインイン中..." : <><LogIn size={18} /> サインイン</>}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <p className="text-muted">アカウントをお持ちでないですか？ <a href="#" style={{ color: 'var(--primary)', fontWeight: 500 }}>管理者に問い合わせ</a></p>
                </div>
            </div>
        </main>
    );
}

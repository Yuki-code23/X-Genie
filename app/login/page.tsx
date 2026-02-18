"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("[Auth] Attempting login for:", email);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("[Auth] Login error:", error);
            let message = error.message;
            if (error.status === 429) {
                message = "ログイン試行回数が制限を超えました。しばらく時間を置いてから再度お試しください（Supabase Auth制限）。";
            } else if (message.includes("Invalid login credentials")) {
                message = "メールアドレスまたはパスワードが正しくありません。本番環境のSupabaseにユーザーが登録されているか確認してください。";
            }
            alert("ログインに失敗しました: " + message);
        } else {
            console.log("[Auth] Login successful");
            window.location.href = "/";
        }
        setLoading(false);
    };

    return (
        <main className="flex items-center justify-center" style={{ minHeight: '100vh', width: '100vw' }}>
            <div className="card glass shadow-2xl" style={{ width: '90%', maxWidth: '420px', padding: '3rem' }}>
                <div className="flex flex-col items-center gap-4" style={{ marginBottom: '2rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '1rem' }}>
                        <img src="/logo.png?v=2" alt="X-Genie Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                    </div>
                    <h1 className="brand-text" style={{ fontSize: '1.75rem' }}>X-Genie ログイン</h1>
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
                    <p className="text-muted">アカウントをお持ちでないですか？ <a href="mailto:yuki.uemotojb@gmail.com?subject=X-Genie%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E7%94%9F%E6%88%90%E4%BE%9D%E9%A0%BC&body=X-Genie%20%E3%81%B8%E3%81%AE%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E7%99%BA%E8%A1%8C%E3%82%92%E4%BE%9D%E9%A0%BC%E3%81%97%E3%81%BE%E3%81%99%E3%80%82%0A%E3%80%90%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%88%E6%B0%8F%E5%90%8D%EF%BC%89%E3%80%91%3A%20%0A%E3%80%90%E5%B8%8C%E6%9C%9B%E3%83%AD%E3%82%B0%E3%82%A4%E3%83%B3%E3%83%A1%E3%83%BC%E3%83%AB%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%80%91%3A%20%0A%E3%80%90%E7%B5%84%E7%B9%94%E5%90%8D%2F%E5%B1%8B%E5%8F%B7%EF%BC%88%E4%BB%BB%E6%84%8F%EF%BC%89%E3%80%91%3A%20%0A%E3%80%90%E3%81%94%E5%88%A9%E7%94%A8%E7%94%A8%E9%80%94%E3%80%91%3A%20%0A%E3%80%90%E3%81%8A%E5%95%8F%E5%90%88%E3%81%9B%E3%81%AE%E3%81%8D%E3%81%A3%E3%81%8B%E3%81%91%E3%80%91%0A%EF%BC%88%E8%A9%B2%E5%BD%93%E3%81%99%E3%82%8B%E3%82%82%E3%81%AE%E3%81%AB%E2%97%8B%E3%82%92%E3%81%A4%E3%81%91%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%EF%BC%89%0A%5B%20%20%5D%20X(Twitter)%E3%81%A7%E3%81%AE%E7%B4%B9%E4%BB%8B%0A%5B%20%20%5D%20%E7%9F%A5%E4%BA%BA%E3%81%8B%E3%82%89%E3%81%AE%E7%B4%B9%E4%BB%8B%0A%5B%20%20%5D%20%E6%A4%9C%E7%B4%A2%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%B3%0A%5B%20%20%5D%20%E3%81%9D%E3%81%AE%E4%BB%96%EF%BC%88%E3%80%80%E3%80%80%E3%80%80%E3%80%80%EF%BC%89" style={{ color: 'var(--primary)', fontWeight: 500 }}>管理者に問い合わせ</a></p>
                </div>
            </div>
        </main>
    );
}

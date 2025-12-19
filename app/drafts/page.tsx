"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, Trash2, Copy, Check, Calendar, Tag, Loader2, FileText, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { parseAIContent } from "@/lib/ai/parser";

interface Draft {
    id: string;
    content: string;
    mode: string;
    event_name: string;
    created_at: string;
    status: string;
}

export default function DraftsPage() {
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching drafts:', error);
        } else {
            setDrafts(data || []);
        }
        setLoading(false);
    };

    const deleteDraft = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('本当に削除しますか？')) return;

        const { error } = await supabase
            .from('drafts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting draft:', error);
            alert('削除に失敗しました');
        } else {
            setDrafts(drafts.filter(d => d.id !== id));
            if (selectedDraft?.id === id) setSelectedDraft(null);
        }
    };


    const handleCopy = (e: React.MouseEvent, text: string, index: number) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'buzz': return '🔥 バズ';
            case 'trust': return '🤝 信頼';
            case 'story': return '📖 ストーリー';
            default: return mode;
        }
    };

    return (
        <main>
            <nav className="glass" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div className="container flex justify-between items-center" style={{ padding: 0 }}>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>下書き一覧</span>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ marginTop: '2rem' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h1 className="title">保存されたドラフト</h1>
                    <p className="text-muted">これまでに生成された投稿案の履歴です。</p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center flex-col gap-4" style={{ minHeight: '300px' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                        <p className="text-muted">読み込み中...</p>
                    </div>
                ) : drafts.length > 0 ? (
                    <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>イベント名</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>作成日時</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>モード</th>
                                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>アクション</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drafts.map((draft) => (
                                        <tr
                                            key={draft.id}
                                            onClick={() => setSelectedDraft(draft)}
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }}
                                            className="hover:bg-white/5"
                                        >
                                            <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.95)' }}>
                                                    {draft.event_name || '名称なしイベント'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                                                <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <Calendar size={14} />
                                                    {formatDate(draft.created_at)}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                                                <span className="flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                                                    {getModeLabel(draft.mode)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'right', verticalAlign: 'top' }}>
                                                <button
                                                    onClick={(e) => deleteDraft(e, draft.id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem 0.6rem', color: '#f87171' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card glass flex flex-col items-center justify-center gap-4" style={{ minHeight: '300px', borderStyle: 'dashed' }}>
                        <div style={{ background: 'var(--muted)', padding: '1.5rem', borderRadius: '50%' }}>
                            <FileText size={40} color="var(--muted-foreground)" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>下書きがありません</h2>
                        <p className="text-muted">AIで生成した投稿案がここに保存されます。</p>
                        <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            最初のドラフトを作成する
                        </Link>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDraft && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem'
                    }}
                    onClick={() => setSelectedDraft(null)}
                >
                    <div
                        className="card glass fade-in"
                        style={{
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '2rem',
                            position: 'relative',
                            background: '#0d1117',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedDraft(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', opacity: 0.6 }}
                        >
                            <X size={20} />
                        </button>

                        <header style={{ marginBottom: '2rem' }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', opacity: 0.7 }}>
                                <Calendar size={14} />
                                <span style={{ fontSize: '0.85rem' }}>{formatDate(selectedDraft.created_at)}</span>
                                <span className="badge" style={{ fontSize: '0.7rem' }}>{getModeLabel(selectedDraft.mode)}</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedDraft.event_name || '名称なしイベント'}</h2>
                        </header>

                        {(() => {
                            const parsed = parseAIContent(selectedDraft.content);
                            if (parsed.isLegacy) {
                                return (
                                    <div className="flex flex-col gap-4">
                                        <div className="card glass" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                                <span className="badge">下書き内容</span>
                                                <button
                                                    onClick={(e) => handleCopy(e, selectedDraft.content, 0)}
                                                    className="btn btn-secondary flex items-center gap-2"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                >
                                                    {copiedIndex === 0 ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedIndex === 0 ? "コピー完了" : "コピー"}
                                                </button>
                                            </div>
                                            <div style={{ whiteSpace: "pre-wrap", fontSize: '0.95rem', lineHeight: 1.7 }}>
                                                {selectedDraft.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex flex-col gap-6">
                                    {/* AI Message */}
                                    <div className="card glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                                            <Sparkles size={14} color="var(--primary)" />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AIからのメッセージ</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.9 }}>
                                            {parsed.comment}
                                        </p>
                                    </div>

                                    {/* Posts */}
                                    <div className="grid gap-4">
                                        {parsed.posts?.map((post, idx) => (
                                            <div key={idx} className="card glass" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                                                    <span className="badge" style={{ fontSize: '0.7rem' }}>投稿案 {idx + 1}</span>
                                                    <button
                                                        onClick={(e) => handleCopy(e, post, idx)}
                                                        className="btn btn-secondary flex items-center gap-2"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                    >
                                                        {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                                        {copiedIndex === idx ? "コピー完了" : "コピー"}
                                                    </button>
                                                </div>
                                                <div style={{ whiteSpace: "pre-wrap", fontSize: '0.95rem', lineHeight: 1.7 }}>
                                                    {post}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Advice */}
                                    <div className="card glass" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
                                        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                                            <FileText size={16} color="var(--primary)" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>解説・アドバイス</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.8, whiteSpace: "pre-wrap" }}>
                                            {parsed.advice}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                                onClick={() => setSelectedDraft(null)}
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

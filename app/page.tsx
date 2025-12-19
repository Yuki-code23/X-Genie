"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Send,
  RefreshCw,
  Settings,
  LogOut,
  Copy,
  Check,
  Layers,
  Calendar,
  Loader2,
  FileText
} from "lucide-react";
import Link from 'next/link';
import { parseAIContent } from "@/lib/ai/parser";

export default function Home() {
  const [input, setInput] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventSummary, setEventSummary] = useState("");
  const [eventTarget, setEventTarget] = useState("");
  const [eventMethod, setEventMethod] = useState("");

  const [mode, setMode] = useState<"buzz" | "trust" | "story">("buzz");
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<{
    content: string,
    model: string,
    keyType: string,
    parsed?: import("@/lib/ai/parser").ParsedAIContent
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);


  const handleGenerate = async () => {
    // Construct consolidated input
    let consolidatedInput = input;
    if (eventName || eventDate || eventSummary || eventTarget || eventMethod) {
      consolidatedInput = `
【イベント名】: ${eventName}
【開催日時】: ${eventDate}
【イベント概要】: ${eventSummary}
【ターゲット/参加者】: ${eventTarget}
【申し込み方法】: ${eventMethod}
${input ? `\n【追加情報】:\n${input}` : ""}
      `.trim();
    }

    if (!consolidatedInput) {
      alert("イベント情報を入力してください");
      return;
    }

    setLoading(true);
    setResultData(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventInfo: consolidatedInput, mode, eventName }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResultData({
        content: data.result,
        model: data.model,
        keyType: data.keyType,
        parsed: parseAIContent(data.result)
      });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleCopy = (post: any, index: number) => {
    const textToCopy = typeof post === 'string' ? post : post.body;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main>
      {/* Header */}
      <nav className="glass" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          <div className="flex items-center gap-2">
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
              <Sparkles size={20} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>X-Genie</span>
          </div>
          <div className="flex gap-4">
            <Link href="/drafts" className="btn btn-secondary"><FileText size={18} /> 下書き</Link>
            <Link href="/settings" className="btn btn-secondary"><Settings size={18} /> 設定</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2rem' }}>
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title">最高の投稿を作成</h1>
          <p className="text-muted">AIを搭載したXマーケティングコンサルタントがあなたの味方に。</p>
        </header>

        <div className="grid">
          {/* Input Section */}
          <section className="flex flex-col gap-6">
            <div className="card glass" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--primary)', padding: '0.4rem', borderRadius: '0.6rem' }}>
                  <Calendar size={18} color="white" />
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>イベント情報を構成</h2>
              </div>

              <div className="grid gap-x-4 gap-y-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginLeft: '0.2rem' }}>イベント名</label>
                  <input
                    className="input"
                    placeholder="例：SNS勉強会"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginLeft: '0.2rem' }}>開催日時</label>
                  <input
                    className="input"
                    placeholder="例：12/25 19:00"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginLeft: '0.2rem' }}>対象・参加者</label>
                  <input
                    className="input"
                    placeholder="例：マーケ担当者"
                    value={eventTarget}
                    onChange={(e) => setEventTarget(e.target.value)}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginLeft: '0.2rem' }}>申し込み方法</label>
                  <input
                    className="input"
                    placeholder="例：プロフリンク"
                    value={eventMethod}
                    onChange={(e) => setEventMethod(e.target.value)}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginLeft: '0.2rem' }}>概要 & メモ</label>
                  <textarea
                    className="textarea"
                    placeholder="イベントの目的や追加の要望など..."
                    style={{ height: '80px', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                  />
                </div>
              </div>

              <div
                className="flex flex-col gap-3"
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>生成モード</span>
                  <div className="flex gap-1">
                    {['buzz', 'trust', 'story'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m as any)}
                        className={`btn ${mode === m ? "btn-primary" : "btn-secondary"}`}
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset' }}
                      >
                        {m === 'buzz' ? 'バズ' : m === 'trust' ? '信頼' : '共感'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '3rem', fontSize: '1rem', marginTop: '0.5rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      ドラフトを生成
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Output Section */}
          <section className="flex flex-col gap-6">
            {resultData?.parsed && (
              <div className="fade-in flex flex-col gap-6">
                {/* AI Response / Comment */}
                <div className="card glass" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem', opacity: 0.8 }}>
                    <div style={{ background: 'var(--primary)', padding: '0.3rem', borderRadius: '0.4rem' }}>
                      <Sparkles size={14} color="white" />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AIからのメッセージ</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                    {resultData.parsed.comment}
                  </p>
                </div>

                {/* Post Plans */}
                <div className="grid gap-4">
                  {resultData.parsed.posts.map((post, idx) => (
                    <div key={idx} className="card glass" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            案 {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                            {typeof post === 'string' ? '' : post.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(post, idx)}
                          className="btn btn-secondary flex items-center gap-2"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset' }}
                        >
                          {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                          {copiedIndex === idx ? "コピー完了" : "コピー"}
                        </button>
                      </div>
                      <div style={{ whiteSpace: "pre-wrap", fontSize: '0.95rem', lineHeight: 1.7 }}>
                        {typeof post === 'string' ? post : post.body}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Advice */}
                <div className="card glass" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                    <FileText size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>解説・アドバイス</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.8, whiteSpace: "pre-wrap" }}>
                    {resultData.parsed.advice}
                  </div>
                  <div className="flex gap-2 items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="badge" style={{ fontSize: '0.65rem', opacity: 0.6 }}>{resultData.keyType}API</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Model: {resultData.model}</span>
                  </div>
                </div>
              </div>
            )}
            {!resultData && (
              <div className="card glass" style={{ borderStyle: 'dashed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                <div style={{ background: 'var(--muted)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem' }}>
                  <Sparkles size={32} color="var(--muted-foreground)" />
                </div>
                <h3 style={{ color: 'var(--muted-foreground)' }}>ここにドラフトが表示されます</h3>
                <p className="text-muted" style={{ maxWidth: '280px', marginTop: '0.5rem' }}>
                  左側にイベントの詳細を入力して、エンゲージメントの高い投稿案を生成しましょう。
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

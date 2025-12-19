import { createClient } from './lib/supabase/server';

async function main() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('ログインユーザーが見つかりません');
        return;
    }

    const testDrafts = [
        {
            user_id: user.id,
            event_name: 'ウィンターフェス2025',
            content: '<comment>冬のイベント、盛り上がりそうですね！</comment><post1>タイトル：【インパクト重視】\n❄️ついに解禁！ウィンターフェス2025開催決定！\n今年の冬は、史上最大の熱狂を。\n詳細はこちら👇\n#ウィンターフェス</post1><post2>タイトル：【ベネフィット重視】\n【限定特典あり】ウィンターフェス2025に参加して、特別な冬の思い出を作りませんか？\n先着100名様にオリジナルグッズをプレゼント！🎁</post2><post3>タイトル：【共感・ストーリー重視】\n「冬は寒いだけじゃない。」\nそんな想いで始めたこのフェスも今年で3年目。\n皆さんの笑顔が見たくて、最高のステージを用意しました。</post3><advice>ターゲット層：20代の若者\n投稿時間帯：21:00頃がおすすめです。</advice>',
            mode: 'buzz',
            model_used: 'manual-test',
            status: 'draft'
        },
        {
            user_id: user.id,
            event_name: 'AIプロダクトローンチ',
            content: '<comment>革新的なプロダクトですね！応援しています。</comment><post1>タイトル：【インパクト重視】\n🚀本日解禁。AIによるSNS運用の新常識。\nこれを使えば、あなたの投稿は劇的に変わる。\n今すぐチェック！</post1><post2>タイトル：【ベネフィット重視】\n【効率化の極致】SNS投稿の作成に何時間もかけていませんか？\nX-Genieを使えば、わずか30秒でプロ級の投稿が完成します。</post2><post3>タイトル：【共感・ストーリー重視】\n「もっと自分の時間を大切にしてほしい。」\nそんな想いから、このAIツールを開発しました。\n複雑な設定は一切不要。あなたのクリエイティビティを解放します。</post3><advice>ターゲット層：個人事業主、マーケター\nビジネスアワー（10:00-12:00）の投稿が効果的です。</advice>',
            mode: 'trust',
            model_used: 'manual-test',
            status: 'draft'
        }
    ];

    const { data, error } = await supabase
        .from('drafts')
        .insert(testDrafts)
        .select();

    if (error) {
        console.error('エラー:', error);
    } else {
        console.log('テストデータを追加しました:', data);
    }
}

main();

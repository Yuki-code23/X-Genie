import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const SYSTEM_PROMPT = `
あなたは、X（旧Twitter）のアルゴリズムとトレンドを熟知した、世界最高峰 of SNSマーケティングコンサルタントです。
ユーザーが提供するイベント情報を元に、インプレッションを最大化し、かつクリックや参加に繋がる「刺さる」投稿文を作成してください。

【X最適化ガイドライン】
1. フックの重要性: 最初の1行（冒頭15〜20文字）で読者の指を止めさせる。
2. 視認性: 適度な改行、箇条書きを駆使し、スマホの1画面で内容が完結するように構成する。
3. 文字数制限: 日本語140文字以内を厳守する。URLを含む場合はその分を考慮する。
4. エンゲージメント設計: 最後に具体的なアクション（リプ欄確認、リンククリック等）を促す。
5. クオリティ管理: 抽象的な表現（「最高な」「素敵な」等）は避け、具体的な数字やベネフィットを提示する。
`;

const MODE_INSTRUCTIONS = {
    buzz: "【バズ・拡散重視】強いパワーワードから開始する。共感、議論、または有益な情報の要約として提示し、リポストを強力に促す。",
    trust: "【信頼・誠実告知】信頼性を重視。イベントの「背景」「目的」「参加メリット」を整理し、誠実なトーンで作成する。",
    story: "【共感・ストーリー】「なぜこのイベントをやるのか」という熱量を伝える。個人の体験や想いをベースにした情緒的な文章にする。"
};

/**
 * Exponential backoff helper with jitter
 */
async function sleepWithJitter(attempt: number) {
    const baseWait = 1000; // 1 second
    const maxWait = 10000; // 10 seconds
    const exponentialWait = Math.min(maxWait, baseWait * Math.pow(2, attempt));
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const totalWait = exponentialWait + jitter;

    console.log(`[AI] Retrying in ${Math.round(totalWait)}ms (Attempt ${attempt + 1})...`);
    return new Promise(resolve => setTimeout(resolve, totalWait));
}

export async function generatePosts(eventInfo: string, mode: 'buzz' | 'trust' | 'story', apiKey?: string) {
    const clientKey = (apiKey && apiKey.trim() !== "") ? apiKey : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!clientKey) {
        throw new Error("Gemini APIキーが設定されていません。環境変数または設定画面でキーを登録してください。");
    }

    // Dynamic model discovery
    let availableModelIds: string[] = ["gemini-1.5-flash"]; // Minimum fallback
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${clientKey}`);
        const data = await response.json();
        if (data.models && data.models.length > 0) {
            availableModelIds = data.models.filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent')
            ).map((m: any) => m.name.replace('models/', ''));
            console.log("[AI] Discovered models:", availableModelIds);
        }
    } catch (e) {
        console.warn("[AI] Model discovery failed, using default fallback list.", e);
    }

    // Primary priority list for model selection
    const priorityModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-latest"];
    let selectedModelId = priorityModels.find(p => availableModelIds.includes(p)) || availableModelIds[0];

    console.log(`[AI] Starting generation. Model: ${selectedModelId} (${apiKey ? 'Custom' : 'System'} Key)`);

    const genAI = new GoogleGenerativeAI(clientKey);
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) await sleepWithJitter(attempt);

            const model = genAI.getGenerativeModel({
                model: selectedModelId,
                systemInstruction: SYSTEM_PROMPT + "\n\n" + MODE_INSTRUCTIONS[mode]
            });

            const prompt = `
以下の情報を元に、X（旧Twitter）向けの投稿文を3案作成してください。
必ず指定のタグで囲んで出力してください。

【イベント情報】
${eventInfo}

【出力形式】
<comment>（ユーザーへの一言返事：入力内容への期待や意気込みなど）</comment>

<post1>
タイトル：【インパクト重視】
（投稿文本文）
</post1>

<post2>
タイトル：【ベネフィット重視】
（投稿文本文）
</post2>

<post3>
タイトル：【共感・ストーリー重視】
（投稿文本文）
</post3>

<advice>
（運用のアドバイス：なぜこの文章にしたか、推奨する投稿時間など）
</advice>
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("AIからの応答が空でした。");

            return {
                content: text,
                model: selectedModelId,
                isCustomKey: !!apiKey
            };

        } catch (error: any) {
            lastError = error;
            const status = error.status || (error.message?.includes('503') ? 503 : error.message?.includes('429') ? 429 : null);

            console.error(`[AI] Attempt ${attempt + 1} failed:`, error.message);

            // If it's a transient error (503, 429, or network issue), we retry
            const isTransient = status === 503 || status === 429 || error.message?.includes('fetch') || error.message?.includes('overloaded');

            if (!isTransient || attempt === maxRetries) {
                // If not transient or last attempt, try switching model as a last resort if it was a 503 or 429
                if ((status === 503 || status === 429) && attempt < maxRetries) {
                    const fallback = availableModelIds.find(m => m !== selectedModelId && priorityModels.includes(m));
                    if (fallback) {
                        console.log(`[AI] ${status} detected. Switching fallback model from ${selectedModelId} to ${fallback}`);
                        selectedModelId = fallback;
                        continue; // Retrying with new model
                    }
                }
                break;
            }
        }
    }

    // Final error formatting for the UI
    let userFriendlyMessage = lastError.message;
    if (lastError.message?.includes('503') || lastError.message?.includes('overloaded')) {
        userFriendlyMessage = "AIサーバーが非常に混み合っています。自動リトライを行いましたが解決しませんでした。数分後にもう一度実行してみてください。";
    } else if (lastError.message?.includes('429')) {
        userFriendlyMessage = "リクエスト制限に達しました。約60秒ほど時間を置いてから再度お試しください。";
    }

    throw new Error(userFriendlyMessage);
}

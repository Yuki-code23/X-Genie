import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { apiKey, provider } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'APIキーを入力してください' }, { status: 400 });
        }

        if (provider === 'gemini') {
            const trimmedKey = apiKey.trim();

            // Definitive test: Fetch available models directly from the API
            try {
                const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`);
                const modelsData = await modelsRes.json();

                if (modelsData.error) {
                    return NextResponse.json({
                        error: `APIキーが認識されましたが、Google側でエラーが発生しました。\n詳細: ${modelsData.error.message}`
                    }, { status: 403 });
                }

                const availableModels = modelsData.models?.map((m: any) => m.name.replace('models/', '')) || [];
                console.log('[API Test] Available models:', availableModels);

                if (availableModels.length === 0) {
                    return NextResponse.json({
                        error: "APIキーは有効ですが、利用可能なモデルが1つも見つかりませんでした。Google AI Studioの設定（Planなど）を確認してください。"
                    }, { status: 403 });
                }

                // If we found models, try a generation with the first one that looks like flash or pro
                const bestModel = availableModels.find((m: string) => m.includes('flash')) || availableModels[0];

                const genAI = new GoogleGenerativeAI(trimmedKey);
                const model = genAI.getGenerativeModel({ model: bestModel });
                const result = await model.generateContent("Hi");
                const response = await result.response;

                if (response.text()) {
                    return NextResponse.json({
                        success: true,
                        modelUsed: bestModel,
                        note: `利用可能なモデルが見つかりました: ${availableModels.slice(0, 3).join(', ')}...`
                    });
                }
            } catch (err: any) {
                return NextResponse.json({
                    error: `接続に失敗しました。ネットワーク設定またはキーを確認してください。\nエラー: ${err.message}`
                }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
    } catch (error: any) {
        console.error('API Key Test Error:', error);
        return NextResponse.json({ error: error.message || '接続テストに失敗しました' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { generatePosts } from '@/lib/ai/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const { eventInfo, mode, eventName } = await req.json();

        if (!eventInfo || !mode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user's custom API key if available
        const { data: keyData, error: fetchError } = await supabase
            .from('user_api_keys')
            .select('api_key')
            .eq('user_id', user.id)
            .eq('provider', 'gemini')
            .maybeSingle();

        if (fetchError) {
            console.error('Error fetching user API key:', fetchError);
        }

        const userApiKey = keyData?.api_key;

        if (userApiKey) {
            console.log(`[API] User API key found for user ${user.id.substring(0, 8)}... (Key starts with: ${userApiKey.substring(0, 4)}...)`);
        } else {
            console.log(`[API] No custom API key found for user ${user.id.substring(0, 8)}..., falling back to system key.`);
        }

        const { content, model: modelUsed, isCustomKey } = await generatePosts(eventInfo, mode, userApiKey);

        // Save to drafts table
        const { error: saveError } = await supabase
            .from('drafts')
            .insert({
                user_id: user.id,
                event_name: eventName || '名称なしイベント',
                content: content,
                mode: mode,
                model_used: modelUsed,
                status: 'draft'
            });

        if (saveError) {
            console.error('Save error:', saveError);
            // We still return the result even if saving fails
        }

        return NextResponse.json({
            result: content,
            model: modelUsed,
            keyType: isCustomKey ? '個人用' : 'システム共有'
        });
    } catch (error: any) {
        console.error('Generation Error:', error);

        // Fetch current key state for error reporting
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: keyData } = user ? await supabase.from('user_api_keys').select('api_key').eq('user_id', user.id).eq('provider', 'gemini').maybeSingle() : { data: null };
        const keyType = keyData?.api_key ? "個人用APIキー" : "システム共有キー";

        return NextResponse.json({
            error: `${error.message}\n\n(使用中のキー: ${keyType})`
        }, { status: 500 });
    }
}

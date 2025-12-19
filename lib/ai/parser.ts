export interface ParsedPost {
    title: string;
    body: string;
}

export interface ParsedAIContent {
    comment: string;
    posts: ParsedPost[];
    advice: string;
    isLegacy?: boolean;
}

export const parseAIContent = (content: string): ParsedAIContent => {
    const extract = (tag: string) => {
        const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return match ? match[1].trim() : "";
    };

    const comment = extract("comment");
    const advice = extract("advice");

    const parsePost = (num: number): ParsedPost | null => {
        const title = extract(`post${num}_title`);
        let body = extract(`post${num}`);

        if (!body) return null;

        // Backward compatibility: If no explicit title tag, try to extract from body
        if (!title) {
            const titleMatch = body.match(/^タイトル：(.*?)\n/);
            if (titleMatch) {
                return {
                    title: titleMatch[1].trim(),
                    body: body.replace(/^タイトル：.*?\n/, "").trim()
                };
            }
            return { title: `案 ${num}`, body };
        }

        return { title, body };
    };

    const posts = [parsePost(1), parsePost(2), parsePost(3)].filter((p): p is ParsedPost => p !== null);

    // If no tags are found, treat as legacy content
    if (!comment && posts.length === 0 && !advice) {
        return {
            comment: "",
            posts: [],
            advice: "",
            isLegacy: true
        };
    }

    return {
        comment,
        posts,
        advice,
        isLegacy: false
    };
};

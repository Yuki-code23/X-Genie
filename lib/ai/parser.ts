/**
 * Parses the structured AI output containing XML-like tags.
 */
export interface ParsedAIContent {
    comment: string;
    posts: string[];
    advice: string;
    isLegacy?: boolean;
}

export const parseAIContent = (content: string): ParsedAIContent => {
    const extract = (tag: string) => {
        const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return match ? match[1].trim() : "";
    };

    const comment = extract("comment");
    const posts = [extract("post1"), extract("post2"), extract("post3")].filter(p => p);
    const advice = extract("advice");

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

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: import.meta.env.VITE_OPENAI_API_URL,
    dangerouslyAllowBrowser: true
});

export const chatCompletion = async (
    messages: { role: 'user' | 'assistant'; content: string }[],
    onProgress: (text: string) => void
    ) => {
    try {
        const stream = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-4o-mini',
            stream: true,
        });

        let fullText = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullText += content;
            onProgress(fullText);
        }

        return {
            role: 'assistant',
            content: fullText
        };
    } catch (error) {
        console.error('OpenAI API 错误:', error);
        throw error;
    }
};
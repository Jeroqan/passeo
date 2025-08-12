import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Converts the OpenAI stream to a Web-API-compliant ReadableStream.
 */
function OpenAIStream(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content || '';
                if (text) {
                    controller.enqueue(encoder.encode(text));
                }
            }
            controller.close();
        },
    });
}


export function streamToResponse(stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>) {
    return new Response(OpenAIStream(stream), {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
        }
    });
} 
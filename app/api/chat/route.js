import { NextResponse } from "next/server";
import OpenAI from 'openai';

const systemPrompt = 'You are a customer support bot for EthioLink, a platform dedicated to helping users find jobs, particularly within the Ethiopian community. Your role is to assist users in creating and optimizing their profiles, navigating job listings, and applying for positions that match their skills and experience. Provide guidance on resume building, interview preparation, and effective job search strategies. Be supportive, informative, and culturally aware, ensuring that users feel confident and empowered throughout their job search journey.';

export async function POST(req) {
    const openai = new OpenAI();
    const data = await req.json();

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4',
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                controller.error(error);
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
    });
    return  new NextResponse(stream)
}

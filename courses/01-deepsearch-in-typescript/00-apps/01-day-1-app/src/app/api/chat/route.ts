import type { Message } from "ai";
import {
  createDataStreamResponse,
  streamText,
  type DataStreamWriter,
} from "ai";
import { z } from "zod";
import { model } from "~/models";
import { searchSerper } from "~/serper";
import { auth } from "~/server/auth";
import { addUserRequest, canUserMakeRequest } from "~/server/db/queries";

export const maxDuration = 60;

export async function POST(request: Request) {
  // Check if user is authenticated
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check rate limiting
  const rateLimitCheck = await canUserMakeRequest(session.user.id);
  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: rateLimitCheck.reason,
        requestCount: rateLimitCheck.requestCount,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Record the request
  await addUserRequest(session.user.id, "/api/chat");

  const body = (await request.json()) as {
    messages: Array<Message>;
  };

  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages } = body;

      const result = streamText({
        model,
        messages,
        maxSteps: 10,
        system: `You are a helpful AI assistant that can search the web to provide accurate, up-to-date information. 

When a user asks a question, you should:
1. Always use the searchWeb tool to find current information about the topic
2. Provide comprehensive answers based on the search results
3. Always cite your sources using inline links in markdown format: [source text](URL)
4. If multiple sources are relevant, include citations from multiple sources
5. Prefer recent and authoritative sources
6. If you cannot find relevant information through search, clearly state this

Remember to search for information before answering questions to ensure your responses are current and accurate.`,
        tools: {
          searchWeb: {
            parameters: z.object({
              query: z.string().describe("The query to search the web for"),
            }),
            execute: async ({ query }, { abortSignal }) => {
              const results = await searchSerper(
                { q: query, num: 10 },
                abortSignal,
              );

              return results.organic.map((result) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
              }));
            },
          },
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error: unknown) => {
      console.error(error);
      return "Oops, an error occured!";
    },
  });
}

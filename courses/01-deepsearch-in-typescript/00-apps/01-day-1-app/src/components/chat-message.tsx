import type { Message } from "ai";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import type { MessagePart } from "~/types";

interface ChatMessageProps {
  message: Message;
  userName: string;
}

const components: Components = {
  // Override default elements with custom styling
  p: ({ children }) => <p className="mb-4 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal pl-4">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code className={`${className ?? ""}`} {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-700 p-4">
      {children}
    </pre>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-blue-400 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};

const Markdown = ({ children }: { children: string }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

const ToolInvocation = ({
  part,
}: {
  part: MessagePart & { type: "tool-invocation" };
}) => {
  const { toolInvocation } = part;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 rounded-lg border border-gray-600 bg-gray-700 p-3">
      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          <span className="text-xs font-semibold">TOOL</span>
        </button>
        <span className="text-sm text-gray-300">{toolInvocation.toolName}</span>
        <span
          className={`rounded px-2 py-1 text-xs ${
            toolInvocation.state === "result"
              ? "bg-green-900 text-green-300"
              : toolInvocation.state === "call"
                ? "bg-blue-900 text-blue-300"
                : "bg-yellow-900 text-yellow-300"
          }`}
        >
          {toolInvocation.state}
        </span>
      </div>

      {isExpanded && (
        <>
          {/* Arguments */}
          <div className="mb-2">
            <div className="mb-1 text-xs font-semibold text-gray-400">
              Arguments:
            </div>
            <pre className="overflow-x-auto rounded bg-gray-800 p-2 text-xs">
              {JSON.stringify(toolInvocation.args, null, 2)}
            </pre>
          </div>

          {/* Result (if available) */}
          {toolInvocation.state === "result" && toolInvocation.result && (
            <div>
              <div className="mb-1 text-xs font-semibold text-gray-400">
                Result:
              </div>
              <pre className="overflow-x-auto rounded bg-gray-800 p-2 text-xs">
                {JSON.stringify(toolInvocation.result, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MessagePartRenderer = ({ part }: { part: MessagePart }) => {
  switch (part.type) {
    case "text":
      return <Markdown>{part.text}</Markdown>;

    case "tool-invocation":
      return <ToolInvocation part={part} />;

    // For now, we'll skip other part types as requested
    default:
      return null;
  }
};

export const ChatMessage = ({ message, userName }: ChatMessageProps) => {
  const isAI = message.role === "assistant";

  return (
    <div className="mb-6">
      <div
        className={`rounded-lg p-4 ${
          isAI ? "bg-gray-800 text-gray-300" : "bg-gray-900 text-gray-300"
        }`}
      >
        <p className="mb-2 text-sm font-semibold text-gray-400">
          {isAI ? "AI" : userName}
        </p>

        <div className="prose prose-invert max-w-none">
          {message.parts && message.parts.length > 0 ? (
            message.parts.map((part, index) => (
              <MessagePartRenderer key={index} part={part} />
            ))
          ) : (
            // Fallback to content if parts is not available
            <Markdown>{message.content}</Markdown>
          )}
        </div>
      </div>
    </div>
  );
};

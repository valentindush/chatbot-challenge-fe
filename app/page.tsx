"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Message } from "@/lib/@types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current!.scrollTo({
          top: scrollAreaRef.current!.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
    };

    const tempAssistantId = `temp-${Date.now()}`;
    const assistantMessage: Message = {
      id: tempAssistantId,
      content: "",
      role: "assistant",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input.trim() }),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const newMessages = prev.map(msg => {
            if (msg.id === tempAssistantId) {
              return { ...msg, content: content };
            }
            return msg;
          });
          return [...newMessages];
        });
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempAssistantId
            ? { ...msg, id: Date.now().toString() }
            : msg
        )
      );

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempAssistantId
            ? { ...msg, content: "Error generating response." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>SMART IT CONSULTING</CardTitle>
          <h2 className="text-xs font-medium">Ask me anything!</h2>
        </CardHeader>
        <CardContent>
          <div
            ref={scrollAreaRef}
            className="h-[60vh] pr-4 overflow-y-auto"
          >
            {messages.map((m) => (
              <div key={m.id} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{m.role === "user" ? "U" : "AI"}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`mx-2 rounded-lg p-3 ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      className="prose"
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="mx-2 rounded-lg p-3 bg-gray-200 text-black">Thinking...</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
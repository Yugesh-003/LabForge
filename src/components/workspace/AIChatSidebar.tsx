import { useState } from "react";
import { Bot, Send, HelpCircle, Lightbulb, CircleAlert, Terminal, X, Sparkles } from "lucide-react";
import { Exercise } from "@/types/labforge";
import { chatWithGeminiServerFn } from "@/api/functions/ai";

interface AIChatSidebarProps {
  exercise?: Exercise;
  onClose?: () => void;
}

interface Message {
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  provider?: string;
}

export function AIChatSidebar({ exercise, onClose }: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: exercise
        ? `Hello! I'm your LabForge AI Tutor powered by Google Gemini. I'm reviewing exercise "${exercise.title}". Ask me any questions or click a quick action below!`
        : "Hello! I can assist you with your laboratory exercises without revealing direct solutions.",
      timestamp: "Just now",
      provider: "Gemini AI",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await chatWithGeminiServerFn({
        data: {
          message: text,
          exerciseTitle: exercise?.title,
          exerciseDescription: exercise?.description,
        },
      });

      const botMsg: Message = {
        sender: "bot",
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: res.provider,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        sender: "bot",
        text: `To approach "${exercise?.title || "this problem"}", review the objective: ${exercise?.learningObjective || "focus on the core objective"}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="labforge-scrollbar flex w-[290px] shrink-0 flex-col border-l border-border bg-sidebar select-none">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded bg-chart-4/15 text-chart-4">
            <Bot size={16} />
          </div>
          <span className="text-xs font-semibold text-foreground">AI Lab Assistant</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Gemini AI Live
          </span>
          {onClose && (
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>


      {/* Messages Feed */}
      <div className="labforge-scrollbar flex-1 space-y-3.5 overflow-y-auto p-4 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 leading-5 ${
                msg.sender === "user"
                  ? "bg-accent text-foreground rounded-tr-none"
                  : "border border-border bg-card text-muted-foreground rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="mt-1 text-[9px] text-muted-foreground/60">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-1 text-chart-4 text-xs italic">
            <Sparkles size={12} className="animate-spin" /> Synthesizing response...
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Assist
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleSend("Can you explain the problem statement?")}
            className="flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <HelpCircle size={12} /> Explain
          </button>
          <button
            onClick={() => handleSend("Give me a hint for this exercise")}
            className="flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <Lightbulb size={12} /> Hint
          </button>
          <button
            onClick={() => handleSend("How can I debug my solution?")}
            className="flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <CircleAlert size={12} /> Debug
          </button>
          <button
            onClick={() => handleSend("Explain expected output format")}
            className="flex items-center justify-center gap-1 rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
          >
            <Terminal size={12} /> Output
          </button>
        </div>

        {/* Input Bar */}
        <div className="mt-2 flex items-end gap-1.5 rounded-md border border-input bg-background p-1.5 focus-within:border-primary">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="min-h-[32px] flex-1 resize-none bg-transparent px-1 text-xs outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="flex size-7 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}

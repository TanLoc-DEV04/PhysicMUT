import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../../../../../services/chatbot.service";

// Import AvatarState type if possible, or redefine it here to avoid circular dependency issues if strict
type AvatarState = "IDLE" | "THINKING" | "EXPLAINING" | "ERROR";

// ────────────────────────────────────────────────────────────────────────────
// XSS PROTECTION — sanitizeHTML
// Escape các ký tự HTML đặc biệt trước khi render vào DOM.
// Dù AI trả về <script>alert('hack')</script>, hàm này biến nó thành văn bản thuần túy.
// ────────────────────────────────────────────────────────────────────────────
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

/**
 * Escape các ký tự HTML nguy hiểm, chuyển xuống dòng thành <br>.
 * Kết quả an toàn để dùng trong dangerouslySetInnerHTML.
 */
function sanitizeHTML(str: string): string {
  return str
    .replace(/[&<>'"]/g, (char) => HTML_ESCAPE_MAP[char] ?? char)
    .replace(/\n/g, '<br>');
}

/** Giới hạn độ dài tin nhắn người dùng (khớp với server-side MAX_MESSAGE_LENGTH) */
const MAX_INPUT_LENGTH = 2000;

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}


interface ChatInterfaceProps {
  onUpdateSimulation: (modelName: string, params: any) => void;
  onStateChange: (state: AvatarState) => void;
  isMobile?: boolean;
}

export default function ChatInterface({
  onUpdateSimulation,
  onStateChange,
  isMobile = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Chào bạn! Mình là PhysicsMUT-bot. Hãy hỏi mình các kiến thức vật lý nhé.",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // ... (handleSendMessage logic remains)

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Set state to THINKING
    onStateChange("THINKING");

    try {
      const response = await sendMessage(inputText);

      const botMessage: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);

      // Set state to EXPLAINING
      onStateChange("EXPLAINING");

      // Go back to IDLE after a few seconds of "explaining"
      setTimeout(() => {
        onStateChange("IDLE");
      }, 5000);

      if (response.tool_call) {
        console.log("Tool call received:", response.tool_call);
        onUpdateSimulation(
          response.tool_call.model_name,
          response.tool_call.parameters,
        );

        const toolMessage: Message = {
          id: messages.length + 3,
          text: `[System] Executing ${response.tool_call.function_call} on ${response.tool_call.model_name} with params: ${JSON.stringify(response.tool_call.parameters)}`,
          sender: "bot",
        };
        setMessages((prev) => [...prev, toolMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error communicating with the server.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Set state to ERROR
      onStateChange("ERROR");
      setTimeout(() => {
        onStateChange("IDLE");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: isOpen ? 0 : "20px",
        left: isOpen ? 0 : "auto",
        right: isOpen ? 0 : "20px",
        width: isOpen ? "100%" : "60px",
        height: isOpen ? "60vh" : "60px",
        backgroundColor: isOpen ? "white" : "rgba(255, 255, 255, 0.9)",
        borderRadius: isOpen ? "20px 20px 0 0" : "50%",
        boxShadow: isOpen ? "0 -4px 10px rgba(0,0,0,0.15)" : "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.2s linear",
        overflow: "hidden",
        cursor: isOpen ? "default" : "pointer",
        padding: (!isOpen && isMobile) ? "10px" : "0", // Increase touch target
        transform: (!isOpen && isPressed) ? "scale(0.9)" : "scale(1)",
        opacity: (!isOpen && isPressed) ? 0.7 : 1,
      }
    : {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        height: isOpen ? "500px" : "48px", // Collapsed height
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
        transition: "height 0.3s ease-in-out",
        overflow: "hidden",
      };

  return (
    <div
      className={isMobile && !isOpen ? "pop-anim" : ""}
      style={containerStyle}
      onClick={() => {
        if (isMobile && !isOpen) setIsOpen(true);
      }}
      onTouchStart={() => {
        if (isMobile && !isOpen) setIsPressed(true);
      }}
      onTouchEnd={(e) => {
        if (isMobile && !isOpen) {
          e.preventDefault();
          setIsPressed(false);
          setIsOpen(true);
        }
      }}
    >
      {/* Header bar: only show if desktop OR (mobile and open) */}
      {(!isMobile || isOpen) && (
        <div
          onClick={() => {
            if (!isMobile || isOpen) setIsOpen(!isOpen);
          }}
          style={{
            backgroundColor: "#0f6cbf",
            color: "white",
            padding: "10px 15px",
            borderTopLeftRadius: isMobile ? "20px" : "10px",
            borderTopRightRadius: isMobile ? "20px" : "10px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span>PhysicsMUT Assistant</span>
          <span>{isOpen ? "−" : "+"}</span>
        </div>
      )}

      {/* Floating Button Icon: only show if mobile and closed */}
      {isMobile && !isOpen && (
        <img
          src="/physicmut-bot-2d.png"
          alt="Bot"
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
        />
      )}

      {isOpen && (
        <>
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender === "user" ? "#DCF8C6" : "#E8E8E8",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                  color: "black",
                }}
                // XSS-safe: nội dung đã được sanitize trước khi render
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(msg.text) }}
              />
            ))}
            {isLoading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  color: "gray",
                  fontStyle: "italic",
                }}
              >
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "10px",
              borderTop: "1px solid #eee",
              display: "flex",
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                // Giới hạn độ dài input client-side trước khi gửi lên server
                if (e.target.value.length <= MAX_INPUT_LENGTH) {
                  setInputText(e.target.value);
                }
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                marginRight: "10px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSendMessage}
              style={{
                backgroundColor: "#0f6cbf",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../../services/chatbotService';

// Import AvatarState type if possible, or redefine it here to avoid circular dependency issues if strict
type AvatarState = 'IDLE' | 'THINKING' | 'EXPLAINING' | 'ERROR';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatInterfaceProps {
  onUpdateSimulation: (modelName: string, params: any) => void;
  onStateChange: (state: AvatarState) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUpdateSimulation, onStateChange }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I am PhysicsMUT-bot. Ask me about physics or command me to control the simulation.", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
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
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Set state to THINKING
    onStateChange('THINKING');

    try {
      const response = await sendMessage(inputText);
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);

      // Set state to EXPLAINING
      onStateChange('EXPLAINING');

      // Go back to IDLE after a few seconds of "explaining"
      setTimeout(() => {
        onStateChange('IDLE');
      }, 5000);

      if (response.tool_call) {
        console.log("Tool call received:", response.tool_call);
        onUpdateSimulation(response.tool_call.model_name, response.tool_call.parameters);
        
        const toolMessage: Message = {
            id: messages.length + 3,
            text: `[System] Executing ${response.tool_call.function_call} on ${response.tool_call.model_name} with params: ${JSON.stringify(response.tool_call.parameters)}`,
            sender: 'bot'
        };
        setMessages(prev => [...prev, toolMessage]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error communicating with the server.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Set state to ERROR
      onStateChange('ERROR');
      setTimeout(() => {
        onStateChange('IDLE');
      }, 3000);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: isOpen ? '500px' : '48px', // Collapsed height
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif',
      transition: 'height 0.3s ease-in-out', // Smooth animation
      overflow: 'hidden' // Hide content when collapsed
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
        backgroundColor: '#0f6cbf',
        color: 'white',
        padding: '10px 15px',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>PhysicsMUT Assistant</span>
        <span>{isOpen ? '−' : '+'}</span>
      </div>
      
      {isOpen && (
      <>
      <div style={{
        flex: 1,
        padding: '10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#E8E8E8',
            padding: '8px 12px',
            borderRadius: '15px',
            maxWidth: '80%',
            wordWrap: 'break-word',
             color: 'black'
          }}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={{ alignSelf: 'flex-start', color: 'gray', fontStyle: 'italic' }}>Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '10px',
        borderTop: '1px solid #eee',
        display: 'flex'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question..."
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            marginRight: '10px',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSendMessage}
          style={{
            backgroundColor: '#0f6cbf',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            cursor: 'pointer'
          }}
        >
          ➤
        </button>
      </div>
      </>
      )}
    </div>
  );
};

export default ChatInterface;

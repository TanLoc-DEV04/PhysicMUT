
interface ChatResponse {
  message: string;
  tool_call?: {
    function_call: string;
    model_name: string;
    parameters: any;
  };
}

export const sendMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};

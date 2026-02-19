from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from rag_engine import query_rag, create_vectorstore
from tools import get_tool_definitions, AVAILABLE_TOOLS
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import json
from dotenv import load_dotenv

load_dotenv()

# Trigger reload
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for debugging connection issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    current_simulation_state: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    tool_call: Optional[Dict[str, Any]] = None

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Check if message triggers a tool call (Simplified logic for now)
        # In a production app, use an LLM with function calling capabilities to decide.
        
        # Initialize LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
        tools = get_tool_definitions()
        llm_with_tools = llm.bind_tools(tools)
        
        messages = [
            {"role": "system", "content": "You are a helpful physics tutor assistant. You can answer questions about physics theory using the provided context and control 3D simulations. When asked to change simulation parameters, use the update_3d_model tool. Context: "},
            {"role": "user", "content": request.message}
        ]
        
        # RAG Retrieval
        rag_results = query_rag(request.message)
        context = "\n".join([doc.page_content for doc in rag_results])
        messages[0]["content"] += context

        response = llm_with_tools.invoke(messages)
        
        tool_call_data = None
        response_message = response.content

        if response.tool_calls:
            tool_call = response.tool_calls[0]
            function_name = tool_call["name"]
            arguments = json.loads(tool_call["args"]) # args is a JSON string
            
            if function_name == "update_3d_model":
                tool_call_data = {
                    "function_call": "update_simulation",
                    "parameters": arguments.get("parameters", {}),
                    "model_name": arguments.get("model_name", "cyclotron")
                }
                response_message = f"I am updating the {arguments.get('model_name')} simulation with your requested parameters."

        return ChatResponse(message=response_message if response_message else "Processing...", tool_call=tool_call_data)

    except Exception as e:
        print(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        file_location = f"data/{file.filename}"
        os.makedirs("data", exist_ok=True)
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        # Re-create vector store with new PDF
        create_vectorstore(file_location)
        
        return {"info": f"file '{file.filename}' saved and indexed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

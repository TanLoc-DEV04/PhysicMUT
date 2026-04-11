from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from rag_engine import query_rag, create_vectorstore, query_design_rag
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
            {"role": "system", "content": "You are a helpful physics tutor assistant. You can answer questions about physics theory using the provided context and control 3D simulations. IMPORTANT: Always cite the source book when using context (e.g., 'Theo tài liệu [Tên sách], ...'). When asked to change simulation parameters, use the update_3d_model tool. Context:\n"}
        ]
        
        # Build search query using history context for better RAG retrieval
        search_query = request.message
        if request.history:
            last_msg = request.history[-1].get("content", "")
            search_query = f"{last_msg}\n{request.message}"
            
        # Add history to messages before the current prompt
        for msg in request.history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role and content:
                messages.append({"role": role, "content": content})
                
        # RAG Retrieval
        rag_results = query_rag(search_query)
        context = "\n".join([f"[Nguồn: {doc.metadata.get('book', 'Không rõ')}] {doc.page_content}" for doc in rag_results])
        messages[0]["content"] += context

        # Append current user message
        messages.append({"role": "user", "content": request.message})

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

class GenerateRequest(BaseModel):
    theory_content: str
    type: str  # "slide" or "quiz"
    num_questions: Optional[int] = 5

@app.post("/generate")
async def generate_content(request: GenerateRequest):
    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0.2, model_kwargs={"response_format": {"type": "json_object"}})
        
        system_prompt = "You are an expert physics teacher and instructional designer. "
        user_prompt = f"Based on the following theory, generate a "
        
        # Retrieve design/pedagogy guidelines based on the request type
        design_query = "Nguyên tắc thiết kế slide bài giảng trực quan, súc tích" if request.type == "slide" else "Cách ra đề trắc nghiệm khách quan tốt, mẹo nhiễu và đánh giá năng lực"
        try:
            design_docs = query_design_rag(design_query, k=3)
            if design_docs:
                system_prompt += "\nHere are some pedagogical and design guidelines you MUST strictly follow:\n"
                for doc in design_docs:
                    system_prompt += f"- {doc.page_content}\n"
        except Exception as e:
            print(f"Design DB retrieval failed (using base prompt): {e}")

        if request.type == "quiz":
            system_prompt += "\nYour task is to create high-quality multiple choice quizzes IN VIETNAMESE language. Return a JSON object with a 'quizzes' array containing objects with 'question', 'options' (array of 4 strings in Vietnamese), 'answer' (the exact string of the correct option), and 'explanation' (in Vietnamese)."
            user_prompt += f"quiz with {request.num_questions} questions in Vietnamese language.\n\nTheory:\n{request.theory_content}"
        elif request.type == "slide":
            system_prompt += "\nYour task is to create educational presentation slides IN VIETNAMESE language. Return a JSON object with a 'slides' array containing objects with 'title' (in Vietnamese), 'content' (array of bullet points in Vietnamese)."
            user_prompt += f"presentation slide deck in Vietnamese language. Extract the main points into clear, concise slides.\n\nTheory:\n{request.theory_content}"
        else:
            raise HTTPException(status_code=400, detail="Invalid generate type")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = llm.invoke(messages)
        
        # Parse the JSON response
        try:
            generated_data = json.loads(response.content)
            return generated_data
        except json.JSONDecodeError:
            print("Failed to decode JSON from OpenAI response:", response.content)
            raise HTTPException(status_code=500, detail="Failed to parse AI response into JSON")
            
    except Exception as e:
        print(f"Error generating content: {e}")
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

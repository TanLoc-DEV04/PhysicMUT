from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import re
import shutil
from rag_engine import query_rag, create_vectorstore, query_design_rag
from tools import get_tool_definitions, AVAILABLE_TOOLS
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import json
from dotenv import load_dotenv

load_dotenv()

# ───────────────────────────────────────────────────────────────────────────────
# RATE LIMITER — Giới hạn 20 request/phút/IP cho /chat, chống spam AI API
# ───────────────────────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# Trigger reload
app = FastAPI(
    title="PhysicMUT Bot API",
    docs_url=None if os.getenv("NODE_ENV") == "production" else "/docs",  # Ẩn docs ở production
    redoc_url=None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ───────────────────────────────────────────────────────────────────────────────
# CORS — Chỉ cho phép domain được cấu hình, không mở wildcard "*" ở production
# ───────────────────────────────────────────────────────────────────────────────
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    *[o.strip() for o in _allowed_origins_env.split(",") if o.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# ───────────────────────────────────────────────────────────────────────────────
# PROMPT INJECTION GUARD — Phát hiện và từ chối các pattern injection phổ biến
# ───────────────────────────────────────────────────────────────────────────────
# Các pattern cố ý làm AI bỏ qua system prompt hoặc tiết lộ thông tin nội bộ
_INJECTION_PATTERNS: list[re.Pattern] = [
    re.compile(r"ignore (all |previous |above |your )?(instructions?|rules?|system|prompt)", re.I),
    re.compile(r"forget (all |previous |above )?(instructions?|context|rules?)", re.I),
    re.compile(r"you are now", re.I),
    re.compile(r"act as (if you are|a|an)", re.I),
    re.compile(r"(reveal|show|print|output|display) (your |the )?(system|hidden|secret) (prompt|instructions?)", re.I),
    re.compile(r"do not follow (your |the )?(rules?|instructions?|guidelines?)", re.I),
    re.compile(r"pretend (you are|to be|that)", re.I),
    re.compile(r"jailbreak", re.I),
    re.compile(r"DAN mode", re.I),
]

# Cực đại ký tự cho phép trong một tin nhắn (chống payload khổng lồ làm OOM)
MAX_MESSAGE_LENGTH = 2000


def prompt_injection_guard(message: str) -> bool:
    """
    Kiểm tra xem tin nhắn có chứa pattern prompt injection không.
    Trả về True nếu phát hiện tấn công, False nếu an toàn.
    """
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(message):
            return True
    return False

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    current_simulation_state: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: str
    tool_call: Optional[Dict[str, Any]] = None

@app.post("/chat", response_model=ChatResponse)
@limiter.limit("20/minute")  # Giới hạn 20 câu hỏi/phút/IP — chống spam AI
async def chat(request: ChatRequest, http_request: Request):
    try:
        # ── Prompt Injection Guard ──────────────────────────────────────────────
        if len(request.message) > MAX_MESSAGE_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Tin nhắn quá dài. Vui lòng giới hạn dưới {MAX_MESSAGE_LENGTH} ký tự.",
            )
        if prompt_injection_guard(request.message):
            print(f"[SECURITY] Prompt injection attempt detected: {request.message[:100]}")
            raise HTTPException(
                status_code=400,
                detail="Thầy không thể xử lý yêu cầu này. Vui lòng đặt câu hỏi liên quan đến Vật lý nhé!",
            )
        # Check if message triggers a tool call (Simplified logic for now)
        # In a production app, use an LLM with function calling capabilities to decide.
        
        # Initialize LLM with local Llama 3.2 1B via Ollama (native client, supports num_ctx)
        llm = ChatOllama(
            model="llama3.2:1b",
            temperature=0.2,
            base_url="http://localhost:11434",
            num_ctx=2048
        )
        tools = get_tool_definitions()
        # llm_with_tools = llm.bind_tools(tools) # llama3:8b does not natively support bind_tools via Ollama's OpenAI API layer
        
        # Build search query using history context for better RAG retrieval
        search_query = request.message
        if request.history:
            last_msg = request.history[-1].get("content", "")
            search_query = f"{last_msg}\n{request.message}"
            
        # RAG Retrieval
        rag_results = query_rag(search_query)
        rag_context_text = "\n".join([f"[Nguồn: {doc.metadata.get('book', 'Không rõ')}] {doc.page_content}" for doc in rag_results])

        # =================================================================
        # THIẾT LẬP CẤU TRÚC REQUEST TỐI ƯU CHO DEEPSEEK PREFIX CACHING
        # =================================================================
        messages = []
        
        # VỊ TRÍ 1 (Cố định nhất): System Prompt (Vai trò, quy tắc an toàn của AI)
        system_rules = """[LỆNH TỐI CAO VÀ BẮT BUỘC]: BẠN PHẢI TRẢ LỜI 100% BẰNG TIẾNG VIỆT TRONG MỌI TÌNH HUỐNG. TUYỆT ĐỐI KHÔNG SỬ DỤNG TIẾNG ANH HOẶC BẤT KỲ NGÔN NGỮ NÀO KHÁC DÙ CHỈ LÀ MỘT CÂU. NẾU USER HỎI BẰNG TIẾNG ANH, HÃY DỊCH RA VÀ TRẢ LỜI BẰNG TIẾNG VIỆT.

1. VAI TRÒ VÀ DANH TÍNH
Bạn là "PhysicMUT-bot", một trợ lý ảo trí tuệ nhân tạo tiên tiến thuộc nền tảng PhysicMUT. Bạn đang đóng vai trò là một Giáo viên Vật lý lớp 12 tận tâm, chuyên nghiệp, uyên bác và thân thiện. 
Mục tiêu tối thượng của bạn là giúp học sinh thấu hiểu bản chất Vật lý, làm chủ các mô hình 3D (Cyclotron, Quang phổ khối, Loa điện động, Mạch dao động LC...) và giải quyết các bài tập một cách thấu đáo.

2. PHONG CÁCH SƯ PHẠM VÀ THÁI ĐỘ (TONE & VOICE)
- Xưng hô: Luôn xưng là "Thầy" (hoặc "Cô", tùy bạn chọn thiết lập) và gọi người dùng là "em" hoặc "các em". Thái độ luôn ân cần, kiên nhẫn và khích lệ.
- Phương pháp giảng dạy (Socratic Method): TUYỆT ĐỐI KHÔNG đưa ngay đáp án cuối cùng cho bài tập tính toán. Hãy dẫn dắt học sinh bằng các câu hỏi gợi mở, phân tích hiện tượng, yêu cầu học sinh viết công thức trước, sau đó mới cùng học sinh giải từng bước.
- Diễn đạt: Sử dụng tiếng Việt mượt mà, tự nhiên, dễ hiểu. Tránh dùng từ Hán-Việt quá phức tạp nếu có từ thuần Việt tương đương. Diễn giải các khái niệm trừu tượng (như từ trường, lực Lorentz, hiện tượng cộng hưởng) thông qua các ví dụ thực tế hoặc hình ảnh trực quan từ mô hình 3D PhysicMUT.
- Khen ngợi: Đừng quên khen ngợi khi học sinh trả lời đúng hoặc có tư duy tốt (VD: "Em tư duy rất chính xác!", "Thầy rất khen ngợi cách em phân tích lực...").

3. QUY TẮC XỬ LÝ KIẾN THỨC (RAG CONTEXT)
- Khi được cung cấp tài liệu ngữ cảnh (Context), bạn phải dựa hoàn toàn vào thông tin trong đó để trả lời. 
- Nếu câu hỏi của học sinh nằm ngoài chương trình Vật lý phổ thông hoặc ngoài tài liệu được cung cấp, hãy trung thực thừa nhận: "Câu hỏi của em rất thú vị, nhưng hiện tại Thầy chưa có đủ dữ liệu trong bài học này để trả lời chính xác. Chúng ta hãy quay lại với mô hình [Tên mô hình] nhé!". KHÔNG được tự bịa đặt kiến thức (No Hallucination).

4. QUY TẮC TRÌNH BÀY VÀ ĐỊNH DẠNG (FORMATTING)
- Chia nhỏ câu trả lời thành các đoạn văn ngắn, sử dụng gạch đầu dòng (-) để liệt kê các ý chính giúp học sinh dễ đọc trên màn hình điện thoại/máy tính.
- Làm nổi bật (in đậm) các từ khóa quan trọng (VD: **Lực Lorentz**, **Động năng**, **Hiện tượng cảm ứng điện từ**).
- [QUAN TRỌNG VỀ TOÁN HỌC]: Bắt buộc sử dụng chuẩn LaTeX để hiển thị công thức. 
  + Dùng `\\( công_thức \\)` cho các biến số hoặc công thức ngắn nằm xen kẽ trong dòng chữ (Inline math). Ví dụ: Khối lượng \\( m \\).
  + Dùng `$$ công_thức $$` cho các phương trình quan trọng cần đứng độc lập một dòng (Display math). Ví dụ: $$ R = \\frac{m \\cdot v}{|q| \\cdot B} $$

5. NHIỆM VỤ ĐỐI VỚI HỆ THỐNG MÔ HÌNH 3D (SERIOUS GAME)
- Khi học sinh hỏi về các nhiệm vụ (Tasks) hoặc huy hiệu (Badges) trong mô hình 3D, hãy hướng dẫn các em chú ý vào các thông số trực quan (như sự đổi màu của mũi tên điện trường, vệt sáng của quỹ đạo hạt, hay biểu đồ SVG trên màn hình). Khuyến khích các em tự tương tác và rút ra quy luật.

[NHẮC LẠI LỆNH TỐI CAO]: MỘT LẦN NỮA, BẠN LÀ GIÁO VIÊN VẬT LÝ VIỆT NAM. TOÀN BỘ CÂU TRẢ LỜI CỦA BẠN BẮT BUỘC PHẢI VIẾT BẰNG TIẾNG VIỆT CHUẨN MỰC, CÓ DẤU ĐẦY ĐỦ.

Quan trọng: Khi được yêu cầu thay đổi thông số mô phỏng, hãy luôn dùng công cụ update_3d_model."""
        messages.append({"role": "system", "content": system_rules})
        
        # VỊ TRÍ 2 (Tương đối cố định): RAG Context (Tài liệu bốc từ Database)
        rag_prompt = f"Hãy sử dụng các tài liệu tham khảo sau đây để trả lời câu hỏi và nhớ trích dẫn nguồn (VD: Theo tài liệu [Tên sách]):\n{rag_context_text}"
        messages.append({"role": "system", "content": rag_prompt})
            
        # VỊ TRÍ 3 (Thay đổi theo Session): Chat History (Lịch sử hội thoại)
        for msg in request.history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role and content:
                messages.append({"role": role, "content": content})
                
        # VỊ TRÍ 4 (Mới hoàn toàn): User Query (Câu hỏi mới nhất)
        messages.append({"role": "user", "content": request.message})

        response = llm.invoke(messages)
        
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

    except HTTPException:
        raise  # Giữ nguyên HTTP exception có dự định
    except Exception as e:
        # Log đầy đủ server-side nhưng ẨN chi tiết khỏi response
        print(f"[ERROR] /chat internal error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Đã xảy ra lỗi xử lý. Vui lòng thử lại sau.")

class GenerateRequest(BaseModel):
    theory_content: str
    type: str  # "slide" or "quiz"
    num_questions: Optional[int] = 5

@app.post("/generate")
async def generate_content(request: GenerateRequest):
    try:
        llm = ChatOllama(
            model="llama3.2:1b",
            temperature=0.2,
            base_url="http://localhost:11434",
            num_ctx=2048,
            format="json"  # Force JSON output mode
        )
        
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

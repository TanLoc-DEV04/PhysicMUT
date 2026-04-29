from pydantic import BaseModel, Field
from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from rag_engine import query_rag

# 1. Định nghĩa Cấu trúc JSON (Pydantic Schema)
class PhysicModelInfo(BaseModel):
    model_name: str = Field(description="Tên của mô hình vật lý bằng tiếng Việt (VD: Máy Cyclotron, Máy quang phổ khối, Loa điện động)")
    description: str = Field(description="Tóm tắt nguyên lý hoạt động của mô hình dựa trên tài liệu (Context)")
    formulas: List[str] = Field(description="Mảng chứa các công thức toán học/vật lý định dạng chuẩn LaTeX có trong tài liệu")
    application: str = Field(description="Ứng dụng thực tế của thiết bị này")

# 2. Thiết lập Llama 3 và Prompt
llm = ChatOpenAI(
    model="llama3:8b", 
    temperature=0, 
    api_key="ollama",
    base_url="http://localhost:11434/v1"
)

structured_llm = llm.with_structured_output(PhysicModelInfo)

system_prompt = """[LỆNH TỐI CAO]: BẮT BUỘC CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT 100%. 
Bạn là trợ lý ảo PhysicMUT. Dựa vào tài liệu Context dưới đây, hãy trích xuất thông tin chính xác về mô hình vật lý.
TUYỆT ĐỐI không bịa đặt thông tin ngoài Context.

Context: 
{context}"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{question}")
])

# 3. Xây dựng Luồng RAG (Retrieval + Generation)
def test_rag_json_flow(user_query: str):
    print(f"\n--- ĐANG TEST CÂU HỎI: '{user_query}' ---")
    
    # 1. Truy xuất tài liệu từ Vector DB
    docs = query_rag(user_query, k=3)
    context_text = "\n\n".join([doc.page_content for doc in docs])
    
    # 2. Định dạng Prompt
    formatted_prompt = prompt.invoke({
        "context": context_text, 
        "question": user_query
    })
    
    # 3. Gửi vào LLM để lấy output JSON
    try:
        # structured_llm sẽ tự động parse câu trả lời thành Object Pydantic
        result = structured_llm.invoke(formatted_prompt)
        
        # 4. Trả về JSON string thuần túy cho Frontend
        json_output = result.model_dump_json(indent=4)
        print("✅ KẾT QUẢ JSON THÀNH CÔNG:")
        print(json_output)
        return json_output
        
    except Exception as e:
        print("❌ LỖI PARSE JSON HOẶC LỖI LLM:")
        print(e)
        return None

# 4. Kịch bản chạy Test (Test Runner)
if __name__ == "__main__":
    # Danh sách các câu hỏi test cho 3 mô hình
    test_queries = [
        "Hãy trích xuất thông tin chi tiết về cấu tạo và nguyên lý của Máy gia tốc Cyclotron.",
        "Khối phổ kế (mass spectrometry) dùng để làm gì và công thức bán kính quỹ đạo của nó ra sao?",
        "Nguyên lý hoạt động và công thức tính lực từ tác dụng lên cuộn dây của Loa điện động là gì?"
    ]

    # Chạy test
    for query in test_queries:
        test_rag_json_flow(query)

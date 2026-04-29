<!-- venv\Scripts\activate
uvicorn main:app --reload -->
Hướng dẫn Test
Bây giờ mọi thứ đã sẵn sàng, bạn có thể kiểm tra luồng AI tại máy bằng cách:

Chạy Bot FastAPI như bình thường:
bash
cd PhysicMUT-bot
.\venv\Scripts\python.exe main.py
Chạy thử Kịch bản trích xuất JSON:
bash
cd PhysicMUT-bot
.\venv\Scripts\python.exe test_llama_rag.py
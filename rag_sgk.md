# Bản Thiết Kế: Nâng Cấp Luồng RAG & Xử Lý Tài Liệu SGK Vật Lý

Dựa trên việc bạn đã chuẩn bị sẵn tài liệu sách giáo khoa (SGK) Vật Lý trong thư mục `FILE/SGK-VAT LY/` (cụ thể là [SGK-Vat-li-12-KNTT.pdf](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/FILE/SGK-VAT%20LY/SGK-Vat-li-12-KNTT.pdf)), tôi xin đề xuất bản thiết kế và hướng hiện thực để nâng cấp luồng RAG cho `PhysicMUT-bot` trở nên thông minh và chính xác hơn.

## 1. Phân tích hiện trạng ([rag_engine.py](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/rag_engine.py))
- Đang dùng `PyMuPDFLoader` và `RecursiveCharacterTextSplitter` (cắt cứng mỗi chunk 1000 ký tự).
- Dùng model embedding `all-MiniLM-L6-v2` (model này hỗ trợ tiếng Anh tốt, nhưng tiếng Việt ở mức cơ bản, dễ bị sai lệch ngữ nghĩa với thuật ngữ Vật Lý).
- Vector DB (Chroma) chưa lưu trữ và filter theo Metadata (ví dụ: Trang số mấy, Bài học tên gì).

## 2. Các Hướng Nâng Cấp Chi Tiết (Proposed Changes)

### 2.1. Cải tiến Embedding Model (Ưu tiên hỗ trợ Tiếng Việt)
- **Vấn đề:** Model `all-MiniLM-L6-v2` xử lý tiếng Việt không tối ưu bằng các model chuyên dụng.
- **Giải pháp:** Sử dụng `OpenAIEmbeddings` model `text-embedding-3-small` hoặc `text-embedding-3-large` (vì bot hiện đã có API key OpenAI sinh ra cho GPT-4o). Hoặc nếu muốn dùng model open-source miễn phí trạy offline, cân nhắc đổi qua các model sentence-transformers hỗ trợ multilingual tốt hơn như `bkai-foundation-models/vietnamese-bi-encoder`.

### 2.2. Xây dựng Script Data Ingestion Riêng Cho Các File SGK
Thay vì để bot nạp file qua API upload lẻ tẻ, ta sẽ viết một script chuyên nạp (ingest) toàn bộ sách trong folder:
- **Tạo file `ingest_sgk.py`**:
  - Tự động duyệt thư mục `FILE/SGK-VAT LY/` để lấy danh sách tất cả các file PDF (bao gồm SGK Vật lí từ lớp 6 đến lớp 12 và sách chuyên đề).
  - Đọc text từ từng file PDF.
  - **Làm sạch dữ liệu (Data Cleaning):** Xóa bỏ các Header/Footer thừa của mỗi trang SGK trước khi chunking để tránh làm rối ngữ cảnh.
  - **Metadata Injection:** Gắn thêm metadata vào mỗi chunk như `{ "source": "SGK-Vat-li-12-KNTT.pdf", "page": 12 }` để LLM biết kiến thức được trích xuất từ sách nào.

### 2.3. Cải tiến kỹ thuật Chunking (Phân mảnh tài liệu)
- **Từ `RecursiveCharacterTextSplitter` sang Semantic/Document Chunking:** SGK có tính cấu trúc rất cao (Phần, Chương, Bài, Mục I, II, III). 
- **Giải pháp:** Có thể kết hợp sử dụng regex hoặc các loader nâng cao hơn để cố gắng giữ trọn vẹn một "Mục" (ví dụ I. Lực Lo-ren-xơ) vào trong 1 chunk hoặc các chunk gắn kết liền mạch với nhau thay vì bị cắt ngang một cách ngẫu nhiên bởi giới hạn 1000 ký tự.

### 2.4. Cải tiến Luồng RAG (Retrieval) trong [main.py](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/main.py)
- **Tích hợp Chat History (Conversational RAG):** Hiện tại API `/chat` định nghĩa `history` nhưng chưa truyền nó vào chuỗi hội thoại khi RAG. Ta cần thiết lập luồng `create_history_aware_retriever` trong Langchain để bot có thể tự nhận biết được "đại từ nhân xưng" (vd: user hỏi "vận tốc của nó là bao nhiêu?", bot qua RAG phải tự hiểu "nó" là hạt electron được nhắc đến ở câu trước).
- **Trích dẫn nguồn gốc (Source Citation):** Bắt buộc LLM phải trả lời kèm theo nguồn, ví dụ *"Theo SGK Vật Lý 12 Kết Nối Tri Thức (Trang 45), Lực Lo-ren-xơ là..."*. Điều này tăng tính học thuật và minh bạch rất lớn cho hệ thống giáo dục.

---

## 3. Kế hoạch triển khai (Verification & Implementation Steps)

### Giai đoạn 1: Chuẩn bị Ingestion Pipeline (Dự kiến: 1 ngày)
1. Cấu hình lại [rag_engine.py](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/rag_engine.py) để sử dụng `OpenAIEmbeddings`.
2. Viết file `ingest_data.py`. Logica:
   - Duyệt qua từng file PDF trong thư mục `FILE/SGK-VAT LY/`.
   - Tiến hành tách trang, làm sạch text mẫu (bỏ tiêu đề trang lặp lại).
   - Chunk, thêm tên sách vào metadata và lưu vào một thư mục Database mới (vd: `chroma_sgk_db`).

### Giai đoạn 2: Cập nhật Bot Logic (Dự kiến: 1 ngày)
1. Cập nhật [main.py](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/main.py): Load `chroma_sgk_db`.
2. Sửa prompt trong [main.py](file:///c:/Users/Lenovo/Documents/HK252/DATN/SOURCE%20CODE/PhysicMUT/PhysicMUT-bot/main.py) để bot phải ưu tiên kiến thức từ SGK, dặn bot trích dẫn số trang dựa trên thẻ `metadata` từ Chroma.
3. Liên kết mảng `history` từ frontend truyền lên vào chuỗi hội thoại của LLM.

### Giai đoạn 3: Kiểm thử tương tác (Verification Plan)
- **Test Case 1 (Truy xuất từ SGK):** Gửi câu hỏi API: *"Cyclotron là gì và công thức bán kính quỹ đạo là gì?"*. Kiểm tra xem bot có trích xuất đúng công thức và lấy đúng nguồn từ SGK 12 không.
- **Test Case 2 (Lưu history):** Gửi câu hỏi API: *"Nó được ứng dụng ở đâu?"* tiếp nối ngay sau câu 1. Kiểm tra xem RAG có hiểu "Nó" đang ám chỉ "Cyclotron" hay không.

## User Review Required
> [!IMPORTANT]
> **Quyết định 1 về Embedding Model**: Bạn có đồng ý đổi sang dùng `OpenAIEmbeddings` (sử dụng API key làm tốn credit nhưng độ chính xác tiếng Việt rất tốt), hay vẫn muốn giữ open-source model chạy offline hoàn toàn (không tốn chi phí nhưng độ chính xác có thể giảm một chút)?
> **Quyết định 2 (Xoá Db Cũ):** Nếu chuyển đổi Model và làm sạch lại text, database Vector hiện tại (`chroma_db`) nên được build lại từ đầu với dữ liệu SGK. Phải đảm bảo việc sinh ra folder DB mới không gây sập hệ thống.


###OCR
Để thực hiện quá trình OCR (đọc chữ từ sách PDF scan), tôi đã viết script ocr_convert.py và cập nhật lại ingest_sgk.py để xử lý file text. Tôi cũng đã cài đặt các thư viện Python cần thiết (pytesseract, Pillow).

Tuy nhiên, do hệ điều hành nền dưới (Windows) cần có engine nhận diện chữ, bạn cần tự cài đặt phần mềm Tesseract OCR vào thiết bị trước khi có thể chạy script ocr_convert.py.

Các bước bạn cần thực hiện như sau:

Trỏ vào đây để tải và cài đặt Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
Trong quá trình cài đặt, ở phần Additional language data (download), bạn nhớ mở rộng và tick chọn tải về gói ngôn ngữ Vietnamese.
Cứ giữ nguyên đường dẫn cài đặt mặc định là C:\Program Files\Tesseract-OCR\tesseract.exe (vì tôi đã gán sẵn cứng vào script rồi).
Sau khi cài thành công, bạn mở terminal lên, chuyển vào thư mục PhysicMUT-bot và chạy hai lệnh sau:
bash
venv\Scripts\activate
python ocr_convert.py
import os
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

# Tesseract configuration for Vietnamese
# BẠN CẦN CÀI ĐẶT TESSERACT OCR TRƯỚC KHI CHẠY (xem hướng dẫn ở dưới)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

DATA_DIR = "./FILE/SGK-VAT LY"
OUTPUT_DIR = "./FILE/SGK-VAT LY-TEXT"

def ocr_pdf_to_text():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for filename in os.listdir(DATA_DIR):
        if not filename.lower().endswith(".pdf"):
            continue
            
        pdf_path = os.path.join(DATA_DIR, filename)
        txt_filename = filename.replace(".pdf", ".txt")
        txt_path = os.path.join(OUTPUT_DIR, txt_filename)
        
        # Bỏ qua nếu đã xử lý rồi
        if os.path.exists(txt_path):
            print(f"Bỏ qua {filename} vì file text đã tồn tại.")
            continue
            
        print(f"Đang xử lý OCR cho: {filename}...")
        try:
            doc = fitz.open(pdf_path)
            extracted_text = []
            
            # Quét từng trang (nếu sách quá dài, có thể test vài trang trước)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # Tăng độ phân giải lên 2x hoặc 3x để OCR đọc chữ rõ hơn
                zoom = 2.0
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat)
                
                # Chuyển đổi pixmap sang đối tượng ảnh PIL
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                
                # Thực hiện OCR với ngôn ngữ tiếng Việt (vie)
                text = pytesseract.image_to_string(img, lang="vie")
                
                # Lưu lại page number dưới dạng thẻ marker để giữ cấu trúc
                extracted_text.append(f"\n--- Trang {page_num + 1} ({filename}) ---\n")
                extracted_text.append(text)
                
                print(f" - Đã OCR xong trang {page_num + 1}/{len(doc)}")
                
            # Ghi ra file text
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write("".join(extracted_text))
                
            print(f"Đã lưu nội dung OCR vào {txt_path}\n")
        except Exception as e:
            print(f"Lỗi khi xử lý file {filename}: {e}")

if __name__ == "__main__":
    print("Bắt đầu tiến trình phân tích hình ảnh (OCR)...")
    ocr_pdf_to_text()

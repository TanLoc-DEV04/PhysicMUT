import requests
import json
import time

url = "http://127.0.0.1:8000/generate"

dummy_theory = """
Máy gia tốc hạt Cyclotron là một thiết bị quan trọng trong vật lý hạt nhân. 
Thiết bị này sử dụng điện trường xoay chiều tần số cao để gia tốc các hạt mang điện băng qua một khoảng trống giữa hai điện cực rỗng có hình chữ D (gọi là hộp D). 
Đồng thời, một từ trường tĩnh, mạnh được đặt vuông góc với mặt phẳng quỹ đạo của hạt để giữ chúng chuyển động trên các quỹ đạo xoắn ốc ngày càng rộng mở. 
Lực Lo-ren-xơ là yếu tố chính gây ra chuyển động tròn này: F = qvB. Khi bán kính quỹ đạo đạt đến mép ngoài của hộp D, hạt sẽ thoát ra với động năng rất lớn để bắn phá các bia vật liệu.
"""

def test_generate(gen_type="slide", num_questions=0, f=None):
    f.write(f"\n--- Testing Generate: {gen_type.upper()} ---\n")
    payload = {
        "theory_content": dummy_theory,
        "type": gen_type,
        "num_questions": num_questions
    }

    start_time = time.time()
    try:
        response = requests.post(url, json=payload, timeout=60)
        end_time = time.time()
        f.write(f"Request took {end_time - start_time:.2f} seconds\n")
        
        if response.status_code == 200:
            data = response.json()
            f.write("\nSUCCESS! Received JSON:\n")
            f.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        else:
            f.write(f"ERROR: {response.status_code}\n")
            f.write(response.text + "\n")
    except Exception as e:
        f.write(f"FAILED to connect or process: {e}\n")

if __name__ == "__main__":
    with open("test_generate_out.txt", "w", encoding="utf-8") as f:
        test_generate("slide", f=f)
        f.write("\n" + "="*50 + "\n")
        test_generate("quiz", num_questions=3, f=f)

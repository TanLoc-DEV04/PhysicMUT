import requests
import json

url = "http://localhost:8000/chat"

# Test 1: Simple Question requiring SGK source
payload1 = {
    "message": "Nêu định nghĩa và công thức tính lực Lo-ren-xơ?",
    "history": []
}

with open("test_out.txt", "w", encoding="utf-8") as f:
    f.write("--- TEST 1: Basic Theory Query ---\n")
    response1 = requests.post(url, json=payload1)
    if response1.status_code == 200:
        res1_data = response1.json()
        f.write("Response: " + res1_data["message"] + "\n\n")
    else:
        f.write("Error: " + str(response1.status_code) + response1.text + "\n\n")

    # Test 2: Follow-up question relying on history
    payload2 = {
        "message": "Lực này có liên quan gì đến Cyclotron không?",
        "history": [
            {"role": "user", "content": "Nêu định nghĩa và công thức tính lực Lo-ren-xơ?"},
            {"role": "assistant", "content": res1_data["message"] if response1.status_code == 200 else "Lực Lo-ren-xơ..."}
        ]
    }

    f.write("--- TEST 2: Conversational History Query ---\n")
    response2 = requests.post(url, json=payload2)
    if response2.status_code == 200:
        f.write("Response: " + response2.json()["message"] + "\n")
    else:
        f.write("Error: " + str(response2.status_code) + response2.text + "\n")


import json
import requests

MODEL_SCHEMAS = {
    "cyclotron": {
        "voltage": "number (Hiệu điện thế U, đv: V/kV)",
        "magneticField": "number (Cảm ứng từ B, đv: T)",
        "particleType": "string (Proton, Deuteron, Alpha)",
        "maxRadius": "number (Bán kính tối đa, đv: m)",
        "isRunning": "boolean (Chạy/Dừng)",
        "showFieldLines": "boolean (Ẩn/Hiện đường sức từ)",
        "showEField": "boolean (Ẩn/Hiện điện trường)"
    },
    "mass_spectrometry": {
        "accelVoltage": "number (Điện áp gia tốc U, đv: V)",
        "magneticField": "number (Cảm ứng từ B, đv: T)",
        "isotopeSelect": "string (Ví dụ: C-12, C-14, U-235, U-238, I-127, I-131)",
        "powerOn": "boolean (Bật/Tắt nguồn)"
    },
    "loudspeaker": {
        "frequency": "number or null (null nếu không nhắc đến)",
        "current": "number or null (null nếu không nhắc đến)",
        "medium": "string or null (Môi trường: water/air/vacuum, null nếu không nhắc)"
    }
}

active_model = "loudspeaker"
schema_text = json.dumps(MODEL_SCHEMAS[active_model], ensure_ascii=False, indent=2)

message = "/3d hãy thay đổi tần số lên 5000"

prompt = f"""You are a parameter extraction AI for the physics model: {active_model}.
Extract physical parameters from the user's message. Output ONLY a valid JSON object.

Required JSON Structure: {{"parameters": {{ ... }}}}

Allowed keys (ONLY use these):
{schema_text}

Rules:
1. If the user mentions a parameter, add it to the JSON.
2. If the user DOES NOT mention a parameter, OMIT IT completely. DO NOT output null or empty strings.
3. Map values correctly (e.g. 'water' to medium).

Example 1: "Tăng hiệu điện thế lên 50kV và từ trường 1.5T" -> {{"parameters": {{"voltage": 50, "magneticField": 1.5}}}}
Example 2: "Đổi môi trường sang water và dòng điện 2A" -> {{"parameters": {{"medium": "water", "current": 2}}}}
Example 3: "Thay đổi tần số lên 5000" -> {{"parameters": {{"frequency": 5000}}}}

User message: "{message}"
JSON: """

pextraction_llm = ChatOllama(
    model="llama3.2:1b",
    temperature=0.1
)

response = requests.post("http://localhost:11434/api/generate", json=payload)
with open("ollama_out.txt", "w", encoding="utf-8") as f:
    f.write(response.json().get('response'))

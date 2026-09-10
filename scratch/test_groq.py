import os
import urllib.request
import json
import time

api_key = os.getenv("GROQ_API_KEY", "")
url = "https://api.groq.com/openai/v1/chat/completions"

models_to_test = [
    "groq/compound-mini",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "allam-2-7b"
]

for model in models_to_test:
    body = {
        "model": model,
        "messages": [
            {"role": "user", "content": 'Respond in JSON with {"status": "ok", "message": "hello"}'}
        ],
        "response_format": {"type": "json_object"}
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            print(f"SUCCESS with {model}: {content}")
            break
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8', errors='ignore')
        print(f"Error with {model}: HTTP {e.code} - {err_msg[:120]}")
        time.sleep(1.5)

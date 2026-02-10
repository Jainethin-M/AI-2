from flask import Flask, render_template, request, jsonify
from datetime import datetime

from gemini import get_ai_reply

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/messages")
def receive_message():
    data = request.get_json(silent=True) or {}

    # Support common keys your frontend might send
    user_text = (
        data.get("text")
        or data.get("message")
        or data.get("content")
        or ""
    )

    print(f"[{datetime.utcnow().isoformat()}Z] incoming message:", data)

    try:
        reply = get_ai_reply(user_text)
        return jsonify({"reply": reply}), 200
    except Exception as e:
        print("Error while generating AI reply:", repr(e))
        return jsonify({"reply": "Sorry — I ran into an error generating a reply."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/messages")
def receive_message():
    data = request.get_json(silent=True) or {}

    # Minimal "backend": just log the payload. No response message required.
    print(
        f"[{datetime.utcnow().isoformat()}Z] incoming message:",
        data
    )

    # No content response (frontend will mark as sent if request succeeds)
    # return ({"message": "Message received"}, 204)
    return jsonify({
        "reply": f"Message received: {data.get('text', 'No text provided')}"
    }), 200

if __name__ == "__main__":
    # Dev server
    app.run(host="127.0.0.1", port=5000, debug=True)

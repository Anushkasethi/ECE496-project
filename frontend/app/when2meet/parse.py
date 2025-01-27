from ics import Calendar
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
@app.route('/parse', methods=['POST'])
def parse_ics():
    file = request.files['file']
    c = Calendar(file.read().decode("utf-8"))

    events = []
    for event in c.events:
        events.append({
            "summary": event.name,  # Course code
            "start": event.begin.format("YYYY-MM-DD HH:mm"),  # Start time
            "end": event.end.format("YYYY-MM-DD HH:mm"),  # End time
        })

    print((events))
    return events

if __name__ == '__main__':
    app.run(debug=True)

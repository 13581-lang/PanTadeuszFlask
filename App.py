from flask import Flask, render_template, request, jsonify, send_from_directory
import csv, os
from datetime import datetime

app = Flask(__name__)
CSV_FILE = 'comments.csv'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<book>.html')
def serve_book(book):
    allowed = ['home'] + [f'k{i}' for i in range(1, 13)]
    if book in allowed:
        return send_from_directory('static/books', f'{book}.html')
    return "Not found", 404

@app.route('/api/comment', methods=['POST'])
def add_comment():
    data = request.get_json() or request.form
    nick = data.get('nick','').strip()
    email = data.get('email','').strip()
    comment = data.get('comment','').strip()
    if not nick or not email or not comment:
        return jsonify({"status":"error","message":"Wszystkie pola wymagane"}),400
    date = datetime.now().strftime('%d.%m.%Y %H:%M')
    row = [nick, email, comment, 'Czeka na weryfikację', date]
    with open(CSV_FILE,'a',newline='',encoding='utf-8') as f:
        csv.writer(f, delimiter=';').writerow(row)
    return jsonify({"status":"ok","message":"Komentarz zapisany!"})

if __name__ == '__main__':
    app.run(debug=True)

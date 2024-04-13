from flask import Flask, request, jsonify, redirect, render_template, url_for
import json
import os
import string
import random

app = Flask(__name__)

# Путь к файлу базы данных JSON
DB_FILE = 'db.json'

# Загружаем данные из JSON файла в словарь
def load_db():
    try:
        if os.path.exists(DB_FILE) and os.path.getsize(DB_FILE) > 0:  # Проверка, что файл существует и не пустой
            with open(DB_FILE, 'r') as file:
                return json.load(file)
        else:
            return {}  # Возвращаем пустой словарь, если файл не существует или пустой
    except json.JSONDecodeError as e:
        print(f"Error reading the DB file: {e}")
        return {}  # Возвращаем пустой словарь в случае ошибки декодирования

# Сохраняем данные в JSON файл
def save_db(db):
    with open(DB_FILE, 'w') as file:
        json.dump(db, file, indent=4)

# Генерируем короткую ссылку
def generate_short_link():
    db = load_db()
    characters = string.ascii_letters + string.digits
    while True:
        short_link = ''.join(random.choice(characters) for _ in range(6))
        if short_link not in db:
            return short_link

# Добавляем новую ссылку в базу данных
def add_url_to_db(original_url, short_link):
    db = load_db()
    db[short_link] = original_url
    save_db(db)

# Главная страница с формой для сокращения URL
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

# Эндпоинт для сокращения URL
@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.get_json()
    original_url = data['url']

    # Проверяем введенный URL на правильность формата
    if not original_url:
        return jsonify({'error': 'No URL provided'}), 400
    if not (original_url.startswith('http://') or original_url.startswith('https://')):
        original_url = 'http://' + original_url

    db = load_db()

    # Ищем уже существующую запись в базе
    for short_link, url in db.items():
        if url == original_url:
            return jsonify({'original_url': original_url, 'short_link': short_link})

    # Если запись не найдена, создаем новую
    short_link = generate_short_link()
    add_url_to_db(original_url, short_link)

    return jsonify({'original_url': original_url, 'short_link': short_link})


# Редирект по короткой ссылке
@app.route('/<short_link>', methods=['GET'])
def redirect_to_url(short_link):
    db = load_db()
    original_url = db.get(short_link)
    if original_url:
        return redirect(original_url)
    else:
        return jsonify({'error': 'Short link not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)


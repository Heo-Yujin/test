from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

db_config = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME"),
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# =========================
# READ
# =========================
@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM products ORDER BY id DESC")
    products = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(products)

# =========================
# CREATE
# =========================
@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "INSERT INTO products (name, price, description) VALUES (%s, %s, %s)"
    cursor.execute(sql, (
        data['name'],
        data['price'],
        data.get('description', '')
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "상품 등록 완료"})

# =========================
# UPDATE
# =========================
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "UPDATE products SET name=%s, price=%s, description=%s WHERE id=%s"
    cursor.execute(sql, (
        data['name'],
        data['price'],
        data.get('description', ''),
        product_id
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "수정 완료"})

# =========================
# DELETE
# =========================
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM products WHERE id=%s", (product_id,))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "삭제 완료"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
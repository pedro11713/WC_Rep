import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import jwt
import datetime

app = Flask(__name__)
CORS(app)

# Configurações
MONGODB_CONECTION_STRING = 'mongodb+srv://PedroS:1234@projeto.xmqgvuu.mongodb.net/?retryWrites=true&w=majority&appName=Projeto'
SECRET_KEY = "segredo_super_secreto"  # Para JWT

client = MongoClient(MONGODB_CONECTION_STRING, tls=True, tlsAllowInvalidCertificates=True)
db = client["Projeto"]
products_collection = db["Produtos"]
users_collection = db["Users"]
cart_collection = db["Carrinho"]

# ===============================
# Helper Functions
# ===============================

def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token ausente'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token inválido'}), 401
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

# ===============================
# Produtos
# ===============================

@app.route("/api/v1/products", methods=["GET"])
def get_products():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    products_cursor = products_collection.find().skip(skip).limit(limit)
    products = [{**prod, "_id": str(prod["_id"])} for prod in products_cursor]
    total = products_collection.count_documents({})

    return jsonify({
        "products": products,
        "page": page,
        "limit": limit,
        "total": total
    })

@app.route("/api/v1/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    try:
        product = products_collection.find_one({"id": product_id})
        if not product:
            return jsonify({"error": "Produto não encontrado"}), 404

        product["_id"] = str(product["_id"])
        return jsonify(product)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/v1/products/<int:product_id>", methods=["DELETE"])
@token_required
def delete_product(product_id):
    result = products_collection.delete_one({"id": product_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Produto não encontrado"}), 404
    return jsonify({"message": "Produto removido com sucesso"}), 200

@app.route("/api/v1/products/<int:product_id>", methods=["PUT"])
@token_required
def update_product(product_id):
    data = request.json
    result = products_collection.update_one({"id": product_id}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Produto não encontrado"}), 404
    return jsonify({"message": "Produto atualizado com sucesso"}), 200

@app.route("/api/v1/products", methods=["POST"])
@token_required
def add_product():
    data = request.json
    result = products_collection.insert_one(data)
    return jsonify({"inserted_id": str(result.inserted_id)}), 201


@app.route("/api/v1/products/featured", methods=["GET"])
def get_featured_products():
    products = products_collection.find({"featured": True}).limit(10)
    return jsonify([{**p, "_id": str(p["_id"])} for p in products])

@app.route("/api/v1/products/categories/<string:categoria>", methods=["GET"])
def get_products_by_category(categoria):
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    products_cursor = products_collection.find({"categoria": categoria}).skip(skip).limit(limit)
    products = [{**p, "_id": str(p["_id"])} for p in products_cursor]
    return jsonify(products)

@app.route("/api/v1/products/price", methods=["GET"])
def get_products_by_price():
    min_price = float(request.args.get("min", 0))
    max_price = float(request.args.get("max", 999999))
    order = request.args.get("order", "asc")

    query = {"preco": {"$gte": min_price, "$lte": max_price}}
    sort_order = 1 if order == "asc" else -1

    products_cursor = products_collection.find(query).sort("preco", sort_order)
    return jsonify([{**p, "_id": str(p["_id"])} for p in products_cursor])

# ===============================
# Carrinho
# ===============================

@app.route("/api/v1/products/cart", methods=["POST"])
def save_cart():
    data = request.json
    print("Dados recebidos do frontend:", data)

    data["created_at"] = datetime.datetime.utcnow()

    # Garante que tens a referência correta à coleção
    carrinho_collection = db["Carrinho"]
    result = carrinho_collection.insert_one(data)

    return jsonify({
        "message": "Carrinho guardado com sucesso!",
        "id": str(result.inserted_id)
    }), 201


@app.route("/api/v1/cart/add", methods=["POST"])
def add_item_to_cart():
    data = request.json
    user_id = data.get("userId", "guest")
    item = data.get("item")

    if not item:
        return jsonify({"error": "Item é obrigatório"}), 400

    existing_cart = cart_collection.find_one({"userId": user_id})

    if existing_cart:
        # Verifica se o produto já existe no carrinho
        existing_item = next((i for i in existing_cart.get("items", []) if i["productId"] == item["productId"]), None)

        if existing_item:
            # Atualiza a quantidade somando a nova quantidade
            new_quantity = existing_item.get("quantity", 1) + item.get("quantity", 1)
            cart_collection.update_one(
                {"userId": user_id, "items.productId": item["productId"]},
                {"$set": {"items.$.quantity": new_quantity}}
            )
        else:
            # Produto não existe ainda, adiciona novo
            cart_collection.update_one(
                {"userId": user_id},
                {"$push": {"items": item}}
            )
    else:
        cart_collection.insert_one({
            "userId": user_id,
            "items": [item],
            "createdAt": datetime.datetime.utcnow()
        })

    return jsonify({"message": "Item adicionado ao carrinho!"}), 200


@app.route("/api/v1/cart", methods=["GET"])
def get_cart_by_user():
    user_id = request.args.get("userId", "guest")
    cart = cart_collection.find_one({"userId": user_id})

    if cart:
        return jsonify({
            "userId": user_id,
            "items": cart.get("items", []),
            "cartId": str(cart["_id"])
        })
    else:
        return jsonify({
            "userId": user_id,
            "items": [],
            "message": "Carrinho vazio."
        })

@app.route("/api/v1/cart/clear", methods=["POST"])
def clear_cart():
    data = request.json
    user_id = data.get("userId", "guest")
    result = cart_collection.delete_one({"userId": user_id})

    return jsonify({
        "message": "Carrinho apagado com sucesso" if result.deleted_count > 0 else "Carrinho não encontrado"
    }), 200

@app.route("/api/v1/products/cart", methods=["GET"])
def get_saved_cart():
    # Vai buscar o carrinho mais recente da coleção Carrinho
    carrinho = cart_collection.find().sort("created_at", -1).limit(1)
    carrinho = list(carrinho)

    if not carrinho:
        return jsonify({"items": []})

    return jsonify({"items": carrinho[0].get("items", [])})

@app.route("/api/v1/cart/remove", methods=["POST"])
def remove_item_from_cart():
    data = request.json
    user_id = data.get("userId", "guest")
    product_id = data.get("productId")

    if not product_id:
        return jsonify({"error": "productId é obrigatório"}), 400

    result = cart_collection.update_one(
        {"userId": user_id},
        {"$pull": {"items": {"productId": product_id}}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Item não encontrado no carrinho"}), 404

    return jsonify({"message": "Item removido com sucesso"}), 200

@app.route("/api/v1/cart/update", methods=["POST"])
def update_cart_item_quantity():
    data = request.json
    print("Dados recebidos para update:", data)
    user_id = data.get("userId", "guest")
    product_id = data.get("productId")
    new_quantity = data.get("quantity")

    if not product_id or new_quantity is None:
        print("Faltam productId ou quantity")
        return jsonify({"error": "productId e quantity são obrigatórios"}), 400

    cart = cart_collection.find_one({"userId": user_id})
    if not cart:
        print("Carrinho não encontrado")
        return jsonify({"error": "Carrinho não encontrado"}), 404

    if new_quantity <= 0:
        cart_collection.update_one(
            {"userId": user_id},
            {"$pull": {"items": {"productId": product_id}}}
        )
        print("Item removido do carrinho")
        return jsonify({"message": "Item removido do carrinho"}), 200

    result = cart_collection.update_one(
        {"userId": user_id, "items.productId": product_id},
        {"$set": {"items.$.quantity": new_quantity}}
    )

    if result.matched_count == 0:
        print("Item não encontrado no carrinho")
        return jsonify({"error": "Item não encontrado no carrinho"}), 404

    print("Quantidade atualizada com sucesso")
    return jsonify({"message": "Quantidade atualizada com sucesso"}), 200


# ===============================
# Autenticação
# ===============================

@app.route("/api/v1/user/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username já existe"}), 400

    users_collection.insert_one({
        "username": username,
        "password": hashed,
        "confirmed": False
    })
    return jsonify({"message": "Utilizador registado"}), 201

@app.route("/api/v1/user/login", methods=["POST"])
def login():
    data = request.json
    user = users_collection.find_one({"username": data.get("username")})

    if not user:
        return jsonify({"error": "Utilizador não encontrado"}), 404

    if not user["confirmed"]:
        return jsonify({"error": "Utilizador ainda não confirmado"}), 403

    if bcrypt.checkpw(data["password"].encode('utf-8'), user["password"]):
        token = jwt.encode({
            "user": user["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401

@app.route("/api/v1/user/confirmation", methods=["POST"])
@token_required
def confirm_user():
    data = request.json
    username = data.get("username")
    result = users_collection.update_one({"username": username}, {"$set": {"confirmed": True}})
    if result.matched_count == 0:
        return jsonify({"error": "Utilizador não encontrado"}), 404
    return jsonify({"message": "Utilizador confirmado"}), 200

# ===============================

if __name__ == "__main__":
    app.run(debug=True)

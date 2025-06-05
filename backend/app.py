import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

import bcrypt
import jwt

from flask import g

# import jwt
from datetime import datetime, timedelta
from functools import wraps
from bson import ObjectId

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'SEGREDO'

# Configurações
MONGODB_CONECTION_STRING = 'mongodb+srv://PedroS:1234@projeto.xmqgvuu.mongodb.net/?retryWrites=true&w=majority&appName=Projeto'
# SECRET_KEY = "segredo_super_secreto"  # Para JWT

client = MongoClient(MONGODB_CONECTION_STRING, tls=True, tlsAllowInvalidCertificates=True)
db = client["Projeto"]
products_collection = db["Produtos"]
users_collection = db["Users"]
cart_collection = db["Carrinho"]
favorites_collection = db["Favoritos"]

# ===============================
# Helper Functions
# ===============================
'''
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
'''


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = None
        # Procura o token no cabeçalho Authorization
        if 'Authorization' in request.headers:
            # Espera o formato "Bearer <token>"
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token de autenticação ausente!'}), 401

        try:
            # Descodifica o token para obter o payload (os dados que guardámos)
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Procura o utilizador na DB para garantir que ele ainda existe
            current_user = users_collection.find_one({'_id': ObjectId(payload['user_id'])})
            if not current_user:
                return jsonify({'message': 'Utilizador do token não encontrado.'}), 401
            # Anexa o payload do token ao objeto global 'g' para a rota poder usar
            g.user_payload = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirou!'}), 401
        except (jwt.InvalidTokenError, IndexError):
            return jsonify({'message': 'Token inválido!'}), 401

        # Chama a função original da rota
        return func(*args, **kwargs)

    return decorated


@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"error": str(e)}), 500


def get_user_id():
    user_id = request.args.get("userId") or request.json.get("userId")
    return user_id if user_id else "user_guest"


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
    products = list(products_collection.find())
    # Calcular média de score para cada produto
    featured = []
    for p in products:
        reviews = p.get("reviews", [])
        if reviews:
            total_score = sum(r.get("score", 0) for r in reviews)
            avg_score = total_score / len(reviews)
            p["avg_score"] = avg_score
            featured.append(p)

    # Ordenar por média de score decrescente e pegar os top 10
    top_products = sorted(featured, key=lambda x: x["avg_score"], reverse=True)[:10]

    # Converter ObjectId para string
    result = [{**p, "_id": str(p["_id"])} for p in top_products]

    return jsonify(result)


@app.route("/api/v1/products/categories/<string:categoria>", methods=["GET"])
def get_products_by_category(categoria):
    products_cursor = products_collection.find({"categoria": categoria})
    products = [{**p, "_id": str(p["_id"])} for p in products_cursor]
    return jsonify(products)


@app.route("/api/v1/products/categories", methods=["GET"])
def get_all_categories():
    categorias = products_collection.distinct("categoria")
    return jsonify(sorted(categorias))


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
# Carrinho (VERSÃO SEGURA COM TOKEN e ID INTEIRO)
# ===============================

@app.route("/api/v1/cart/add", methods=["POST"])
@token_required  # Proteger a rota
def add_item_to_cart():
    user_id = g.user_payload['user_id']
    data = request.json

    # O frontend agora envia o item diretamente no body
    item_to_add = data.get("item")
    if not item_to_add or 'productId' not in item_to_add:
        return jsonify({"message": "Dados do item inválidos."}), 400

    # Usamos o 'id' inteiro do produto
    product_id_int = item_to_add.get("productId")

    # Procura o carrinho do utilizador
    user_cart = cart_collection.find_one({"user_id": ObjectId(user_id)})

    if user_cart:
        # Verifica se o item (com mesma ID, cor e tamanho) já existe
        existing_item = next((i for i in user_cart.get("items", [])
                              if i.get("productId") == product_id_int and
                              i.get("size") == item_to_add.get("size") and
                              i.get("color") == item_to_add.get("color")), None)

        if existing_item:
            # Se existe, incrementa a quantidade
            cart_collection.update_one(
                {"_id": user_cart["_id"], "items.productId": product_id_int, "items.size": item_to_add.get("size"),
                 "items.color": item_to_add.get("color")},
                {"$inc": {"items.$.quantity": item_to_add.get("quantity", 1)}}
            )
        else:
            # Se não existe, adiciona o novo item ao array
            cart_collection.update_one(
                {"_id": user_cart["_id"]},
                {"$push": {"items": item_to_add}}
            )
    else:
        # Se o carrinho não existe, cria um novo
        cart_collection.insert_one({
            "user_id": ObjectId(user_id),
            "items": [item_to_add],
            "createdAt": datetime.utcnow()
        })

    return jsonify({"message": "Item adicionado ao carrinho!"}), 200


@app.route("/api/v1/cart", methods=["GET"])
@token_required
def get_cart_by_user():
    user_id = g.user_payload['user_id']
    cart = cart_collection.find_one({"user_id": ObjectId(user_id)})

    if cart:
        cart["_id"] = str(cart["_id"])
        cart["user_id"] = str(cart["user_id"])
        return jsonify(cart)
    else:
        # Retorna um carrinho vazio se não for encontrado
        return jsonify({"items": [], "user_id": user_id})


# Adicione as outras rotas (remove, update, clear) com a mesma lógica de autenticação
# Exemplo para remover:
@app.route("/api/v1/cart/remove", methods=["POST"])
@token_required
def remove_item_from_cart():
    user_id = g.user_payload['user_id']
    data = request.json
    product_id_int = data.get("productId")
    # ... (lógica de remoção) ...
    # ... você precisa garantir que remove o item correto (pode precisar de size e color)
    cart_collection.update_one(
        {"user_id": ObjectId(user_id)},
        {"$pull": {"items": {"productId": product_id_int}}}
    )
    return jsonify({"message": "Item removido"}), 200

# ===============================
# Favoritos
# ===============================

@app.route("/api/v1/favoritos/add", methods=["POST"])
@token_required
def add_favorite():
    user_id = g.user_payload['user_id']
    data = request.json
    # O frontend vai enviar o 'id' inteiro do produto
    product_id_int = data.get("productId")

    if product_id_int is None:
        return jsonify({"message": "O ID do produto é obrigatório."}), 400

    # Guarda o 'id' inteiro
    existing = favorites_collection.find_one({
        "user_id": ObjectId(user_id),
        "product_id": product_id_int
    })

    if existing:
        return jsonify({"message": "Produto já está nos favoritos."}), 200

    favorites_collection.insert_one({
        "user_id": ObjectId(user_id),
        "product_id": product_id_int
    })
    return jsonify({"message": "Adicionado aos favoritos."}), 201


@app.route("/api/v1/favoritos/remove", methods=["POST"])
@token_required
def remove_favorite():
    user_id = g.user_payload['user_id']
    data = request.json
    product_id_int = data.get("productId")

    if product_id_int is None:
        return jsonify({"message": "O ID do produto é obrigatório."}), 400

    result = favorites_collection.delete_one({
        "user_id": ObjectId(user_id),
        "product_id": product_id_int
    })
    if result.deleted_count > 0:
        return jsonify({"message": "Removido dos favoritos."}), 200
    else:
        return jsonify({"message": "Favorito não encontrado."}), 404


@app.route("/api/v1/favoritos", methods=["GET"])
@token_required
def get_favorites():
    user_id = g.user_payload['user_id']

    # 1. Encontrar os 'id's inteiros dos produtos favoritados
    favorite_links = list(favorites_collection.find({"user_id": ObjectId(user_id)}))
    product_int_ids = [f.get("product_id") for f in favorite_links if "product_id" in f]

    if not product_int_ids:
        return jsonify([])

    # 2. Buscar os produtos que correspondem a esses 'id's inteiros
    products = list(products_collection.find({"id": {"$in": product_int_ids}}))

    # 3. Preparar a resposta
    result = []
    for p in products:
        p["_id"] = str(p["_id"])
        result.append(p)

    return jsonify(result)
# ===============================
# Autenticação
# ===============================

@app.route("/api/v1/user/signup", methods=["POST"])
def signup():
    data = request.json
    # Corrigido para receber os campos enviados pelo frontend
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Validação básica
    if not name or not email or not password:
        return jsonify({"message": "Faltam campos obrigatórios."}), 400

    # Verificar se o email já existe
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Este email já está a ser utilizado."}), 400

    # Criptografar a password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Inserir o novo utilizador com os campos corretos
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        # Adicionei este campo, pode ser útil no futuro
        "confirmed": True  # Ou False se precisar de confirmação por email
    })

    return jsonify({"message": "Utilizador registado com sucesso!"}), 201


@app.route("/api/v1/user/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email e palavra-passe são obrigatórios."}), 400

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"message": "Credenciais inválidas."}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user.get("password")):
        # A password está correta, gerar o token
        payload = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(hours=24) # Usando a versão compatível
        }

        # jwt.encode() na sua versão já retorna uma string. Não precisa de .decode()
        token = jwt.encode(
            payload,
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        # Retornar a resposta que o frontend espera
        return jsonify({
            "token": token,  # Usar a variável 'token' diretamente
            "user": {
                "_id": str(user["_id"])
            }
        })
    else:
        # A password está incorreta
        return jsonify({"message": "Credenciais inválidas."}), 401


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

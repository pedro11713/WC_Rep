import React, {useState, useEffect, useContext} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {FavoriteContext} from "../Favoritos/FavoriteContext";
import "../../styles/PagProduto.css";
import {CartContext} from "../Carrinho/CartContext";

function PagProduto() {
    const {id} = useParams();
    const [produto, setProduto] = useState(null);
    const [semelhantes, setSemelhantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tamanho, setTamanho] = useState("");
    const [cor, setCor] = useState("");


    const {addToFavorites, removeFromFavorites, isFavorited} = useContext(FavoriteContext);
    const [favoritado, setFavoritado] = useState(false);

    const {addToCart} = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProduto() {
            try {
                const res = await fetch(`http://localhost:5000/api/v1/products/${id}`);
                if (!res.ok) throw new Error("Produto não encontrado");
                const data = await res.json();
                setProduto(data);
                setTamanho(data?.size?.[0] || "");
                setCor(data?.color?.[0] || "");
            } catch (err) {
                console.error(err);
                setProduto(null);
            } finally {
                setLoading(false);
            }
        }

        fetchProduto();
    }, [id]);

    useEffect(() => {
        async function fetchSemelhantes() {
            try {
                const res = await fetch(`http://localhost:5000/api/v1/products?limit=1000`);
                const data = await res.json();
                const todos = data.products || [];
                const semelhantesFiltrados = todos.filter(
                    (p) => p.category === produto?.category && String(p._id) !== String(id)
                );
                setSemelhantes(semelhantesFiltrados);
            } catch (err) {
                console.error("Erro ao buscar semelhantes:", err);
            }
        }

        if (produto) fetchSemelhantes();
    }, [produto, id]);

    async function handleAddToCart() {
        if (!produto) return;

        const item = {
            productId: produto._id,
            name: produto.name,
            price: produto.price,
            image: produto.image,
            size: tamanho,
            color: cor,
            quantity: 1,
        };

        try {
            const response = await fetch("http://localhost:5000/api/v1/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: "guest",
                    item,
                }),
            });

            if (response.ok) {
                alert("Produto adicionado ao carrinho!");
            } else {
                const error = await response.json();
                alert("Erro ao adicionar ao carrinho: " + error.message);
            }
        } catch (err) {
            console.error("Erro:", err);
            alert("Erro ao conectar ao servidor.");
        }
    }


    //Aquiiii
    // Dentro de PagProduto()

    useEffect(() => {
        if (produto) {
            setFavoritado(isFavorited(produto._id));
        }
    }, [produto, isFavorited]);

    async function handleFavoritar() {
        if (!produto) return;

        if (favoritado) {
            await removeFromFavorites(produto._id);
        } else {
            await addToFavorites(produto);
        }

        setFavoritado(!favoritado);
    }

    //Aquiiii

    if (loading) return <div>Carregando...</div>;
    if (!produto) return <div className="produto-nao-encontrado">Produto não encontrado!</div>;

    return (
        <div className="pag-produto-container">
            <div className="produto-card">
                <div className="produto-img-box">
                    <div className="produto-imagem-placeholder">
                        <span>Imagem</span>
                    </div>
                </div>
                <div className="produto-info-box">
                    <h1 className="produto-nome">{produto.name}</h1>
                    <p className="produto-descricao">{produto.description}</p>
                    <p className="produto-categoria"><b>Categoria:</b> {produto.category}</p>
                    <p className="produto-preco">€{produto.price?.toFixed(2)}</p>
                    <p className="produto-stock"><b>Stock:</b> {produto.stock}</p>
                    <div className="produto-opcoes">
                        <label>
                            Tamanho:
                            <select value={tamanho} onChange={e => setTamanho(e.target.value)}>
                                {produto.size?.map(tam => (
                                    <option key={tam} value={tam}>{tam}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Cor:
                            <select value={cor} onChange={e => setCor(e.target.value)}>
                                {produto.color?.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="produto-acoes">
                        <button className="btn btn-favoritos" onClick={handleFavoritar}>
                            {favoritado ? "💖 Favoritado" : "❤ Favorito"}
                        </button>
                        <button onClick={handleAddToCart}>Adicionar ao carrinho</button>
                    </div>
                </div>
            </div>

            <div className="produto-reviews-box">
                <h2>Comentários</h2>
                <ul className="produto-reviews-list">
                    {produto.reviews?.map((r, idx) => (
                        <li key={idx} className="produto-review">
                            <div>
                                <b>{r.username}</b>
                                <span className="produto-review-score">
                  {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                </span>
                            </div>
                            <div>{r.comment}</div>
                        </li>
                    ))}
                    {(!produto.reviews || produto.reviews.length === 0) && <li>Nenhum comentário ainda.</li>}
                </ul>
            </div>

            <div className="produtos-semelhantes-box">
                <h2>Produtos Semelhantes</h2>
                <ul className="produtos-semelhantes-list">
                    {semelhantes.map(p => (
                        <li key={p._id}>
                            <Link to={`/produto/${p._id}`}>{p.name}</Link>
                        </li>
                    ))}
                    {semelhantes.length === 0 && <li>Nenhum produto semelhante.</li>}
                </ul>
            </div>
        </div>
    );
}

export default PagProduto;

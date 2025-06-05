import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FavoriteContext } from "../Favoritos/FavoriteContext"; // Ajuste o caminho se necessário
import { CartContext } from "../Carrinho/CartContext";
import "../../styles/PagProduto.css";

function PagProduto() {
    const { id } = useParams(); // Este 'id' é o inteiro da URL, o que está correto.
    const [produto, setProduto] = useState(null);
    const [semelhantes, setSemelhantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tamanho, setTamanho] = useState("");
    const [cor, setCor] = useState("");

    // --- Lógica de autenticação e contexto ---
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { addToFavorites, removeFromFavorites, isFavorited } = useContext(FavoriteContext);
    const { addToCart } = useContext(CartContext);
    const [favoritado, setFavoritado] = useState(false); // Mantemos o estado local para o botão

    // --- Lógica de busca de dados (ajustada para ser consistente) ---
    useEffect(() => {
        setLoading(true);
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
            if (!produto) return;
            try {
                const res = await fetch(`http://localhost:5000/api/v1/products?limit=1000`);
                const data = await res.json();
                const todos = data.products || [];
                // CORREÇÃO: Usar 'produto.id' (inteiro) para a comparação
                const semelhantesFiltrados = todos.filter(
                    (p) => p.category === produto.category && p.id !== produto.id
                );
                setSemelhantes(semelhantesFiltrados);
            } catch (err) {
                console.error("Erro ao buscar semelhantes:", err);
            }
        }
        fetchSemelhantes();
    }, [produto]);


    // --- Lógica das ações do utilizador (atualizada e segura) ---

    // Este useEffect atualiza o estado do botão local 'favoritado'
    useEffect(() => {
        if (produto) {
            // CORREÇÃO: usa 'produto.id' para verificar
            setFavoritado(isFavorited(produto.id));
        }
    }, [produto, isFavorited]); // A dependência do contexto (isFavorited) é suficiente

    // Lida com o clique no botão de favoritar
    async function handleFavoritar() {
        if (!produto) return;
        if (!token) {
            alert("Precisa de fazer login para gerir os favoritos.");
            navigate('/login');
            return;
        }

        // Usa as funções do contexto, que já esperam o 'id' inteiro
        if (favoritado) {
            await removeFromFavorites(produto.id);
        } else {
            await addToFavorites(produto); // Envia o objeto produto inteiro
        }
        // Atualiza o estado local para o feedback visual imediato
        setFavoritado(!favoritado);
    }

    // Lida com o clique no botão de adicionar ao carrinho
    function handleAddToCart() {
        if (!produto) return;
        if (!token) {
            alert("Precisa de fazer login para adicionar ao carrinho.");
            navigate('/login');
            return;
        }
        const item = {
            productId: produto.id, // CORREÇÃO: Usa o 'id' inteiro
            name: produto.name,
            price: produto.price,
            image: produto.image_url, // Assumindo que o campo é image_url
            size: tamanho,
            color: cor,
            quantity: 1,
        };
        // O CartContext também precisará ser ajustado para usar a autenticação
        addToCart(item);
        alert("Produto adicionado ao carrinho!");
    }

    if (loading) return <div>Carregando...</div>;
    if (!produto) return <div className="produto-nao-encontrado">Produto não encontrado!</div>;

    // --- SEU JSX ORIGINAL INTACTO ---
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
                                {produto.size?.map(tam => (<option key={tam} value={tam}>{tam}</option>))}
                            </select>
                        </label>
                        <label>
                            Cor:
                            <select value={cor} onChange={e => setCor(e.target.value)}>
                                {produto.color?.map(c => (<option key={c} value={c}>{c}</option>))}
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
                            <div><b>{r.username}</b><span className="produto-review-score">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span></div>
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
                        // CORREÇÃO: Usa 'p.id' para a key e o link
                        <li key={p.id}><Link to={`/products/${p.id}`}>{p.name}</Link></li>
                    ))}
                    {semelhantes.length === 0 && <li>Nenhum produto semelhante.</li>}
                </ul>
            </div>
        </div>
    );
}

export default PagProduto;
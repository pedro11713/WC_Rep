// src/pages/PagProduto.js
import React, {useState, useContext} from "react";
import {useParams, Link} from "react-router-dom";
import {FavoriteContext} from "../Favoritos/FavoriteContext";
import products from "../../products.json";
import "../../styles/PagProduto.css";
import {useNavigate} from "react-router-dom"; // <--- ADICIONA ISTO
import {CartContext} from "../Carrinho/CartContext";


function PagProduto() {
    const {id} = useParams();
    const produto = products.find((p) => String(p.id) === String(id));
    const [tamanho, setTamanho] = useState(produto?.size?.[0] || "");
    const [cor, setCor] = useState(produto?.color?.[0] || "");
    const {addToFavorites} = useContext(FavoriteContext);
    const {addToCart} = useContext(CartContext);

    const navigate = useNavigate(); // <--- ADICIONA ISTO

    if (!produto) return <div className="produto-nao-encontrado">Produto não encontrado!</div>;

    const semelhantes = products.filter(
        (p) => p.category === produto.category && String(p.id) !== String(id)
    );

    function handleFavoritar() {
        addToFavorites(produto);
        navigate("/favoritos");
    }


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
                    <p className="produto-preco">€{produto.price.toFixed(2)}</p>
                    <p className="produto-stock"><b>Stock:</b> {produto.stock}</p>
                    <div className="produto-opcoes">
                        <label>
                            Tamanho:
                            <select value={tamanho} onChange={e => setTamanho(e.target.value)}>
                                {produto.size.map(tam => (
                                    <option key={tam} value={tam}>{tam}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Cor:
                            <select value={cor} onChange={e => setCor(e.target.value)}>
                                {produto.color.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="produto-acoes">
                        <button className="btn btn-favoritos" onClick={handleFavoritar}>❤ Favorito</button>
                        <button
                            className="btn btn-carrinho"
                            onClick={() => {
                                const itemComOpcoes = {
                                    ...produto,
                                    size: tamanho,
                                    color: cor,
                                };
                                addToCart(itemComOpcoes);
                                navigate("/carrinho");
                            }}
                        >
                            🛒 Carrinho
                        </button>


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
                                <span
                                    className="produto-review-score">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
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
                        <li key={p.id}>
                            <Link to={`/produto/${p.id}`}>{p.name}</Link>
                        </li>
                    ))}
                    {semelhantes.length === 0 && <li>Nenhum produto semelhante.</li>}
                </ul>
            </div>
        </div>
    );
}

export default PagProduto;

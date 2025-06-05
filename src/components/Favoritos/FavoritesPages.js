import React, { useEffect, useState } from "react";

const FavoritesPages = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = "guest"; // ou outro id, se estiver autenticado

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/favoritos?userId=${userId}`);
        const data = await res.json();
        setFavorites(data || []); // Supondo que a API retorna lista direta
      } catch (err) {
        console.error("Erro ao buscar favoritos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [userId]);

  const handleRemoveFavorite = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/favoritos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((item) => item._id !== productId));
      } else {
        console.error("Erro ao remover favorito");
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  if (loading) return <p>A carregar favoritos...</p>;
  if (favorites.length === 0) return <p>Não tens favoritos guardados.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Os teus Favoritos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favorites.map((product) => (
          <div
            key={product._id}
            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p>{product.description}</p>
            <p className="text-green-600 font-semibold mt-2">{product.price}€</p>
            <button
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => handleRemoveFavorite(product._id)}
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPages;

import React, { createContext, useState, useEffect, useCallback } from 'react';

export const FavoriteContext = createContext();

export function FavoriteProvider({ children }) { // Export nomeado é uma boa prática
  const [favoriteItems, setFavoriteItems] = useState([]);
  const token = localStorage.getItem('token');

  // Função para carregar os favoritos do utilizador autenticado
  const fetchFavorites = useCallback(async () => {
    // Se não há token, não há favoritos para carregar
    if (!token) {
      setFavoriteItems([]);
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/favoritos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setFavoriteItems(data || []);
      } else {
        console.error('Falha ao carregar favoritos:', res.statusText);
        if (res.status === 401) {
            setFavoriteItems([]); // Limpa se o token for inválido/expirado
        }
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
    }
  }, [token]);

  // Carrega os favoritos quando o componente monta ou o token muda
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);


  // --- FUNÇÕES DE INTERAÇÃO ATUALIZADAS PARA USAR 'ID' INTEIRO ---

  async function addToFavorites(item) {
    if (!token) return; // A verificação já acontece na página, mas é bom ter aqui também
    try {
      // CORREÇÃO: Envia o 'item.id' (inteiro)
      const res = await fetch('http://127.0.0.1:5000/api/v1/favoritos/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: item.id }),
      });

      if (res.ok) {
        // Atualiza o estado local para feedback imediato
        setFavoriteItems((prev) => [...prev, item]);
      } else {
        console.error("Erro ao adicionar favorito:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao adicionar favorito:", err);
    }
  }

  async function removeFromFavorites(productIdInt) {
    if (!token) return;
    try {
      // CORREÇÃO: Envia o 'productIdInt' (inteiro)
      const res = await fetch('http://127.0.0.1:5000/api/v1/favoritos/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productIdInt }),
      });
      if (res.ok) {
        // CORREÇÃO: Filtra usando o 'item.id' (inteiro)
        setFavoriteItems((prev) => prev.filter((item) => item.id !== productIdInt));
      } else {
        console.error("Erro ao remover favorito:", await res.text());
      }
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
    }
  }

  // CORREÇÃO: Verifica a existência de um favorito usando o 'id' inteiro
  function isFavorited(productIdInt) {
    return favoriteItems.some((item) => item.id === productIdInt);
  }

  // O valor fornecido pelo contexto
  const value = {
    favoriteItems,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    fetchFavorites
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
}
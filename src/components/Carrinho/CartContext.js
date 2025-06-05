import React, { createContext, useState, useEffect, useCallback } from 'react';

// 1. Cria o contexto
export const CartContext = createContext();

// 2. Cria o Provedor (Provider)
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false); // Para feedback visual
    const token = localStorage.getItem('token');

    // --- FUNÇÕES DE API ---

    // Função para carregar o carrinho do utilizador
    const fetchCart = useCallback(async () => {
        if (!token) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/api/v1/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCartItems(data.items || []);
            } else {
                setCartItems([]); // Limpa em caso de erro (ex: token inválido)
            }
        } catch (error) {
            console.error("Erro ao carregar carrinho:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Carrega o carrinho quando o componente monta ou o token muda
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Função genérica para fazer chamadas de API do carrinho
    const updateCartOnServer = async (endpoint, body) => {
        if (!token) return false;
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/v1/cart/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            return res.ok;
        } catch (error) {
            console.error(`Erro na operação do carrinho [${endpoint}]:`, error);
            return false;
        }
    };


    // --- FUNÇÕES DE AÇÃO (expostas para os componentes) ---

    const addToCart = async (item) => {
        const success = await updateCartOnServer('add', { item });
        if (success) {
            // Recarrega o carrinho para obter o estado mais recente da DB
            await fetchCart();
        } else {
            alert("Ocorreu um erro ao adicionar o item ao carrinho.");
        }
    };

    const removeFromCart = async (itemIdentifier) => {
        // itemIdentifier pode ser um objeto com productId, size, color
        const success = await updateCartOnServer('remove', itemIdentifier);
        if (success) {
            await fetchCart();
        } else {
            alert("Ocorreu um erro ao remover o item.");
        }
    };

    const updateQuantity = async (itemIdentifier, newQuantity) => {
        const success = await updateCartOnServer('update', { ...itemIdentifier, quantity: newQuantity });
        if (success) {
            await fetchCart();
        } else {
            alert("Ocorreu um erro ao atualizar a quantidade.");
        }
    };

    const clearCart = async () => {
        const success = await updateCartOnServer('clear', {});
        if (success) {
            setCartItems([]); // Limpa o estado local imediatamente
        } else {
            alert("Ocorreu um erro ao limpar o carrinho.");
        }
    };


    // --- VALOR A SER FORNECIDO PELO CONTEXTO ---
    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart // Exporta para poder recarregar manualmente se necessário
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
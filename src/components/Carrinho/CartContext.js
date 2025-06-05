import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

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
                setCartItems([]);
            }
        } catch (error) {
            console.error("Erro ao carregar carrinho:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

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

    const addToCart = async (item) => {
        const success = await updateCartOnServer('add', { item });
        if (success) {
            await fetchCart();
        } else {
            alert("Ocorreu um erro ao adicionar o item ao carrinho.");
        }
    };

    const removeFromCart = async (itemIdentifier) => {
        // --- Atualização Otimista ---
        const originalCart = [...cartItems];
        const newCart = cartItems.filter(item => !(item.productId === itemIdentifier.productId && item.size === itemIdentifier.size && item.color === itemIdentifier.color));
        setCartItems(newCart);

        const success = await updateCartOnServer('remove', itemIdentifier);
        if (!success) {
            setCartItems(originalCart); // Reverte se a API falhar
            alert("Ocorreu um erro ao remover o item.");
        }
    };

    // --- A FUNÇÃO CRUCIAL MODIFICADA ---
    const updateQuantity = async (itemIdentifier, newQuantity) => {
        if (newQuantity < 1) return; // Não permite quantidade menor que 1

        // 1. Atualização Otimista no Frontend
        const originalCart = [...cartItems]; // Guarda o estado original
        const updatedCart = cartItems.map(item => {
            if (item.productId === itemIdentifier.productId && item.size === itemIdentifier.size && item.color === itemIdentifier.color) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        setCartItems(updatedCart); // Atualiza a UI imediatamente

        // 2. Envia a atualização para o Backend em segundo plano
        const success = await updateCartOnServer('update', { ...itemIdentifier, quantity: newQuantity });

        // 3. Se a API falhar, reverte a alteração na UI
        if (!success) {
            setCartItems(originalCart);
            alert("Ocorreu um erro ao atualizar a quantidade.");
        }
    };


    const clearCart = async () => {
        const success = await updateCartOnServer('clear', {});
        if (success) {
            setCartItems([]);
        } else {
            alert("Ocorreu um erro ao limpar o carrinho.");
        }
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
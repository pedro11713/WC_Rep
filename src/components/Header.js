import React from 'react';
import '../styles/Header.css';
import Logo from '../assets/img.png';

function Header() {
    return (
        <header className="header">
            <div className="logo">

                <img src={Logo} alt="Logo" className="logo-img"/>
            </div>

            <nav className="nav-links">
                <a href="/">Início</a>
                <a href="/produtos">Produtos</a>
                <a href="/favoritos">Favoritos</a>

            </nav>
            <div className="cart">
                 <a href="/carrinho"> 🛒 </a>
                <div className="cart-count">1</div>
            </div>
        </header>
    );
}

export default Header;

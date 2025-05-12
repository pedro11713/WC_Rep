import React from 'react';

import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} MyStore. Todos os direitos reservados.</p>
      <div className="footer-links">
        <a href="#">Termos de Serviço</a>
        <a href="#">Política de Privacidade</a>
        <a href="#">Contacto</a>
      </div>
    </footer>
  );
}

export default Footer;

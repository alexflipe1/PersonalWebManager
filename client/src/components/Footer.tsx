const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} Meu Site. Todos os direitos reservados.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary transition duration-200">Termos de Uso</a>
            <a href="#" className="hover:text-primary transition duration-200">Privacidade</a>
            <a href="#" className="hover:text-primary transition duration-200">Contato</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

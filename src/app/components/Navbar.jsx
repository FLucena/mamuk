// components/Navbar.js
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-custom-color-500 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/">Mamuk Training
          </Link>
          <ul className="flex space-x-4">
            <li>
              <Link href="/about">Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link href="/ejercicios"> Ejercicios
              </Link>
            </li>
            <li>
              <Link href="/contact">Contacto
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

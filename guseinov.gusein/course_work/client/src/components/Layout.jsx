import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const catalogActive = location.pathname.startsWith("/catalog");
  const cartActive = location.pathname.startsWith("/cart");

  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <NavLink to="/" className="logo" aria-label="Gadget Hub">
            <span>Gadget</span> Hub
          </NavLink>
          <nav className="header__nav">
            <NavLink to="/" className={`nav-btn ${location.pathname === "/" ? "is-active" : ""}`}>
              Главная
            </NavLink>
            <NavLink to="/catalog" className={`nav-btn ${catalogActive ? "is-active" : ""}`}>
              <img src="/images/icons/catalog.svg" alt="" width="16" height="16" />
              Каталог
            </NavLink>
            {user ? (
              <>
                <NavLink to="/cart" className={`nav-btn ${cartActive ? "is-active" : ""}`}>
                  <img src="/images/icons/card.svg" alt="" width="16" height="16" />
                  Корзина
                  {count > 0 ? <span className="badge">{count}</span> : null}
                </NavLink>
                <button type="button" className="nav-btn" onClick={logout}>
                  <img src="/images/icons/profile.svg" alt="" width="16" height="16" />
                  Выйти
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav-btn">
                  <img src="/images/icons/profile.svg" alt="" width="16" height="16" />
                  Войти
                </NavLink>
                <NavLink to="/login?mode=register" className="nav-btn">
                  Регистрация
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <div className="logo logo--light">
              <span>Gadget</span> Hub
            </div>
            <p className="footer__tag">Магазин надежных гаджетов</p>
            <p className="footer__copy">© 2024 ООО “Гаджет Хаб”. Все права защищены</p>
          </div>
          <a className="footer__phone" href="tel:88006783424">
            <img src="/images/icons/mobile.svg" alt="" width="16" height="22" />
            8 (800) 678-34-24
          </a>
          <div className="footer__social">
            <a href="https://vk.com" target="_blank" rel="noreferrer" aria-label="VK">
              <img src="/images/social/vk.png" alt="" />
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram">
              <img src="/images/social/telegram.png" alt="" />
            </a>
            <a href="https://wa.me" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <img src="/images/social/whatsapp.png" alt="" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

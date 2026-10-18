import { createContext, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import Modal from "../components/Modal.jsx";

const GuestPromptContext = createContext(null);

export function GuestPromptProvider({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      requireUser(action) {
        if (user) {
          action?.();
          return true;
        }
        setOpen(true);
        return false;
      },
    }),
    [user],
  );

  return (
    <GuestPromptContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} className="modal--alert">
        <h3>Нужна авторизация</h3>
        <p>Чтобы добавить товар в корзину, войдите или зарегистрируйтесь.</p>
        <div className="modal__actions">
          <Link to="/login" className="btn" onClick={() => setOpen(false)}>
            Войти
          </Link>
          <Link to="/login?mode=register" className="btn btn--ghost" onClick={() => setOpen(false)}>
            Регистрация
          </Link>
        </div>
      </Modal>
    </GuestPromptContext.Provider>
  );
}

export function useGuestPrompt() {
  return useContext(GuestPromptContext);
}

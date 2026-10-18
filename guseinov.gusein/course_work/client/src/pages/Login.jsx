import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "../components/Modal.jsx";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (params.get("mode") === "register") setMode("register");
  }, [params]);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!username.trim()) next.username = "Заполните обязательное поле";
    else if (username.trim().length < 3) next.username = "Минимум 3 символа";
    if (!password) next.password = "Заполните обязательное поле";
    else if (mode === "register" && password.length < 6) next.password = "Минимум 6 символов";
    if (mode === "register" && password !== passwordRepeat) next.passwordRepeat = "Пароли не совпадают";
    setErrors(next);
    setServerError("");
    if (Object.keys(next).length) return;
    try {
      if (mode === "register") await register(username.trim(), password);
      else await login(username.trim(), password);
      navigate("/");
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art" aria-hidden>
        <span className="blob blob--blue" />
        <span className="blob blob--pink" />
        <span className="blob blob--yellow" />
        <span className="blob blob--mint" />
      </div>
      <div className="login-card">
        <div className="login-switch">
          <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>
            Вход
          </button>
          <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")}>
            Регистрация
          </button>
        </div>
        <h1>{mode === "register" ? "Создайте аккаунт" : "Добро пожаловать!"}</h1>
        <form onSubmit={onSubmit} noValidate>
          <label className={errors.username ? "field is-error" : "field"}>
            Логин <span>*</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
            {errors.username ? <small>{errors.username}</small> : null}
          </label>
          <label className={errors.password ? "field is-error" : "field"}>
            Пароль <span>*</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {errors.password ? <small>{errors.password}</small> : null}
          </label>
          {mode === "register" ? (
            <label className={errors.passwordRepeat ? "field is-error" : "field"}>
              Повторите пароль <span>*</span>
              <input
                type="password"
                value={passwordRepeat}
                onChange={(event) => setPasswordRepeat(event.target.value)}
              />
              {errors.passwordRepeat ? <small>{errors.passwordRepeat}</small> : null}
            </label>
          ) : null}
          <button type="submit" className="btn">
            {mode === "register" ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>
      </div>
      <Modal open={Boolean(serverError)} onClose={() => setServerError("")} className="modal--alert">
        <p>{serverError}</p>
        <button type="button" className="btn" onClick={() => setServerError("")}>
          Ок
        </button>
      </Modal>
    </div>
  );
}

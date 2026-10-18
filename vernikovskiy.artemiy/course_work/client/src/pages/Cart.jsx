import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, formatPrice, isRussianPhone, isValidEmail, plural } from "../api.js";
import { getOrderStatus } from "../orderStatus.js";
import { useCart } from "../context/CartContext.jsx";
import Modal from "../components/Modal.jsx";
import Quantity from "../components/Quantity.jsx";

export default function Cart() {
  const cart = useCart();
  const [tab, setTab] = useState("cart");
  const [selected, setSelected] = useState([]);
  const [orders, setOrders] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [success, setSuccess] = useState(null);
  const [opened, setOpened] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [form, setForm] = useState({
    phone: "",
    email: "",
    delivery: "pickup",
    address: "",
    payment: "",
    wrap: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api("/orders").then(setOrders).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(timer);
  }, []);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allSelected = cart.items.length > 0 && cart.items.every((item) => selectedSet.has(item.id));
  const openedStatus = opened ? getOrderStatus(opened, orders, now) : null;

  function toggleAll() {
    setSelected(allSelected ? [] : cart.items.map((item) => item.id));
  }

  function askDelete(ids) {
    setConfirm(ids);
  }

  function doDelete() {
    cart.remove(confirm);
    setSelected((current) => current.filter((id) => !confirm.includes(id)));
    setConfirm(null);
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (!form.phone.trim()) next.phone = "Заполните обязательное поле";
    else if (!isRussianPhone(form.phone)) next.phone = "Введите номер в формате +7 999 123-45-67";
    if (form.email.trim() && !isValidEmail(form.email)) next.email = "Введите корректный email";
    if (!form.payment) next.payment = "Заполните обязательное поле";
    if (form.delivery === "delivery" && !form.address.trim()) next.address = "Заполните обязательное поле";
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      const order = await api("/orders", {
        method: "POST",
        body: {
          items: cart.items.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer: form,
        },
      });
      cart.clear();
      setSelected([]);
      setSuccess(order);
      setOrders((current) => [order, ...current]);
    } catch (error) {
      setSuccess({ error: error.message });
    }
  }

  return (
    <div className="container cart-page">
      <div className="tabs">
        <button type="button" className={tab === "cart" ? "is-active" : ""} onClick={() => setTab("cart")}>
          Корзина
        </button>
        <button type="button" className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")}>
          История заказов
        </button>
      </div>

      {tab === "history" ? (
        <div className="panel">
          {orders.length === 0 ? (
            <p className="empty">Заказов пока нет</p>
          ) : (
            orders.map((order) => {
              const status = getOrderStatus(order, orders, now);
              return (
                <div key={order.number} className="history-row">
                  <button type="button" className="history-row__main" onClick={() => setOpened(order)}>
                    <span>
                      № {order.number} от {formatDate(order.date)}
                    </span>
                    <span>
                      {order.itemCount} {plural(order.itemCount, "товар", "товара", "товаров")}
                    </span>
                    <span>{formatPrice(order.total)}</span>
                    <span className={`status-pill status-pill--${status.id}`}>{status.label}</span>
                  </button>
                  <button
                    type="button"
                    className="link-btn history-row__cancel"
                    onClick={() => {
                      setOpened(null);
                      setCancelError("");
                      setCancelReason("");
                      setCancelTarget(order);
                    }}
                  >
                    Отменить
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : cart.items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart__art">🛒</div>
          <h2>Пока пусто</h2>
          <p>Ознакомьтесь с новинками и хитами на главной или найдите нужное в каталоге</p>
          <div className="empty-cart__actions">
            <Link to="/catalog" className="btn">
              Перейти в каталог
            </Link>
            <Link to="/" className="btn btn--ghost">
              Главная страница
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="panel">
            <div className="cart-toolbar">
              <label className="check">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                Выбрать все
              </label>
              {selected.length ? (
                <button type="button" className="link-btn" onClick={() => askDelete(selected)}>
                  Удалить все
                </button>
              ) : null}
            </div>
            {cart.items.map((item) => (
              <div key={item.id} className="cart-row">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(item.id)}
                    onChange={() =>
                      setSelected((current) =>
                        current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }
                  />
                </label>
                <img src={item.image} alt="" />
                <p className="cart-row__name">{item.name}</p>
                <Quantity value={item.quantity} onChange={(next) => cart.setQuantity(item.id, next)} />
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button type="button" className="link-btn" onClick={() => askDelete([item.id])}>
                  × Удалить
                </button>
              </div>
            ))}
            <p className="cart-total">
              {cart.count} {plural(cart.count, "товар", "товара", "товаров")} на {formatPrice(cart.total)}
            </p>
          </div>

          <h2>Оформление заказа</h2>
          <form className="panel checkout" onSubmit={submit} noValidate>
            <div className="checkout__row">
              <label className={errors.phone ? "field is-error" : "field"}>
                Телефон <span>*</span>
                <input
                  value={form.phone}
                  placeholder="+7 999 123-45-67"
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
                {errors.phone ? <small>{errors.phone}</small> : null}
              </label>
              <label className={errors.email ? "field is-error" : "field"}>
                E-mail
                <input
                  type="email"
                  value={form.email}
                  placeholder="name@example.com"
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
                {errors.email ? <small>{errors.email}</small> : null}
              </label>
            </div>
            <div className="radios">
              <label>
                <input
                  type="radio"
                  name="delivery"
                  checked={form.delivery === "pickup"}
                  onChange={() => setForm({ ...form, delivery: "pickup" })}
                />
                Самовывоз
              </label>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  checked={form.delivery === "delivery"}
                  onChange={() => setForm({ ...form, delivery: "delivery" })}
                />
                Доставка
              </label>
            </div>
            {form.delivery === "delivery" ? (
              <label className={errors.address ? "field is-error" : "field"}>
                Адрес доставки <span>*</span>
                <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
                {errors.address ? <small>{errors.address}</small> : null}
              </label>
            ) : null}
            <label className={errors.payment ? "field is-error" : "field"}>
              Способ оплаты <span>*</span>
              <select value={form.payment} onChange={(event) => setForm({ ...form, payment: event.target.value })}>
                <option value="">Не выбрано</option>
                <option value="card">По карте</option>
                <option value="cash">Наличными</option>
              </select>
              {errors.payment ? <small>{errors.payment}</small> : null}
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.wrap}
                onChange={(event) => setForm({ ...form, wrap: event.target.checked })}
              />
              Нужна упаковка
            </label>
            <button type="submit" className="btn">
              Оформить заказ
            </button>
          </form>
        </>
      )}

      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} className="modal--alert">
        <h3>Вы уверены, что хотите удалить?</h3>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setConfirm(null)}>
            Отмена
          </button>
          <button type="button" className="btn btn--pink" onClick={doDelete}>
            Да, удалить
          </button>
        </div>
      </Modal>

      <Modal open={Boolean(success)} onClose={() => setSuccess(null)} className="modal--alert">
        {success?.error ? (
          <p>{success.error}</p>
        ) : (
          <>
            <h3>Спасибо за заказ!</h3>
            <p>Номер заказа {success?.number}.</p>
            <p className="muted">Мы свяжемся с вами в течение 10 минут, чтобы уточнить удобное для вас время доставки</p>
          </>
        )}
        <button type="button" className="btn" onClick={() => setSuccess(null)}>
          Ок
        </button>
      </Modal>

      <Modal open={Boolean(opened)} onClose={() => setOpened(null)} className="modal--wide">
        {opened && openedStatus ? (
          <div className="order-modal">
            <h2>Заказ № {opened.number}</h2>
            <p className="muted">от {formatDate(opened.date)}</p>
            <ol className="status-track">
              {openedStatus.stages.map((stage) => (
                <li
                  key={stage.id}
                  className={stage.current ? "is-current" : stage.done ? "is-done" : ""}
                >
                  {stage.label}
                </li>
              ))}
            </ol>
            <p className="status-track__note">
              Загруженность магазина: {Math.round(openedStatus.timeline.load * 100)}%. Сроки зависят от очереди заказов.
            </p>
            <ul className="order-goods">
              {opened.items.map((item) => (
                <li key={item.id}>
                  {item.image ? <img src={item.image} alt="" /> : null}
                  <div className="order-goods__info">
                    <span className="order-goods__name">{item.name}</span>
                    <span className="order-goods__sum">
                      {item.quantity} × {formatPrice(item.price)}
                      <strong>{formatPrice(item.total)}</strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="cart-total">{formatPrice(opened.total)}</p>
            <button
              type="button"
              className="btn btn--pink"
              onClick={() => {
                setCancelError("");
                setCancelReason("");
                setCancelTarget(opened);
              }}
            >
              Отменить заказ
            </button>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} className="modal--alert">
        <form
          className="cancel-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const reason = cancelReason.trim();
            if (reason.length < 3) {
              setCancelError("Укажите причину отмены");
              return;
            }
            try {
              await api(`/orders/${cancelTarget.number}`, { method: "DELETE", body: { reason } });
              setOrders((current) => current.filter((item) => item.number !== cancelTarget.number));
              if (opened?.number === cancelTarget.number) setOpened(null);
              setCancelTarget(null);
              setCancelReason("");
              setCancelError("");
            } catch (error) {
              setCancelError(error.message);
            }
          }}
        >
          <h3>Отмена заказа № {cancelTarget?.number}</h3>
          <p className="muted">Укажите причину — после этого заказ будет удалён из истории.</p>
          <label className={cancelError ? "field is-error" : "field"}>
            Причина отмены <span>*</span>
            <textarea
              rows={4}
              value={cancelReason}
              placeholder="Например, передумал / ошибка в заказе"
              onChange={(event) => {
                setCancelReason(event.target.value);
                setCancelError("");
              }}
            />
            {cancelError ? <small>{cancelError}</small> : null}
          </label>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setCancelTarget(null)}>
              Назад
            </button>
            <button type="submit" className="btn btn--pink">
              Подтвердить отмену
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

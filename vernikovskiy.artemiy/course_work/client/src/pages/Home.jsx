import { useEffect, useState } from "react";
import { api } from "../api.js";
import Carousel from "../components/Carousel.jsx";
import Modal from "../components/Modal.jsx";
import ProductModal from "../components/ProductModal.jsx";

export default function Home() {
  const [goods, setGoods] = useState([]);
  const [opened, setOpened] = useState(null);

  useEffect(() => {
    api("/goods").then(setGoods).catch(() => setGoods([]));
  }, []);

  const hits = goods.filter((item) => item.isHit);
  const news = goods.filter((item) => item.isNew);

  return (
    <div className="container home">
      <section className="hero">
        <div className="hero__copy">
          <p className="hero__sale">SUPER SALE</p>
          <div className="hero__badge">
            <span>-10%</span>
            <strong>27 990 ₽</strong>
            <s>31 100 ₽</s>
          </div>
          <p className="hero__title">Умный робот-друг Red solution Reddy Air</p>
        </div>
      </section>

      <section className="section section--split">
        <div className="section__intro">
          <div className="section__icon section__icon--hit">🔥</div>
          <h2>Хиты продаж</h2>
          <p>Тысячи покупателей уже одобрили эти товары. Самые популярные, проверенные и надежные гаджеты!</p>
        </div>
        <Carousel items={hits} onOpen={setOpened} />
      </section>

      <section className="section section--split">
        <div className="section__intro">
          <div className="section__icon section__icon--new">✨</div>
          <h2>Новинки</h2>
          <p>Их только произвели - они уже у нас! Все самое новое и свежее на рынке электроники</p>
        </div>
        <Carousel items={news} onOpen={setOpened} />
      </section>

      <section className="section">
        <h2>Преимущества</h2>
        <div className="benefits">
          <article>
            <div className="benefits__icon benefits__icon--pink">🚀</div>
            <h3>Утром заказали, вечером получили</h3>
          </article>
          <article>
            <div className="benefits__icon">↩️</div>
            <h3>С товаром что-то не так? Вернем деньги</h3>
          </article>
          <article>
            <div className="benefits__icon benefits__icon--green">🔎</div>
            <h3>Только оригинальные товары</h3>
          </article>
        </div>
      </section>

      <section className="section contacts">
        <h2>Работаем 24/7</h2>
        <div className="contacts__grid">
          <p>📞 8 (800) 678-34-24</p>
          <p>✉️ gadget@hub.ru</p>
          <p>📍 Санкт-Петербург, ул. Барочная, д.7, корпус 2</p>
        </div>
      </section>

      <Modal open={Boolean(opened)} onClose={() => setOpened(null)} className="modal--wide">
        <ProductModal product={opened} onClose={() => setOpened(null)} />
      </Modal>
    </div>
  );
}

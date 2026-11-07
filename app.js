const PRODUCTS = [
  { id: 1, name: 'Беспроводные наушники', cat: 'Электроника', price: 4990, emoji: '🎧', desc: 'Bluetooth 5.3, 30 часов работы' },
  { id: 2, name: 'Смарт-часы', cat: 'Электроника', price: 8990, emoji: '⌚', desc: 'Пульс, сон, уведомления' },
  { id: 3, name: 'Портативная колонка', cat: 'Электроника', price: 3490, emoji: '🔊', desc: 'Водонепроницаемая, 12 Вт' },
  { id: 4, name: 'Рюкзак городской', cat: 'Одежда', price: 2790, emoji: '🎒', desc: 'Отделение для ноутбука 15"' },
  { id: 5, name: 'Кроссовки', cat: 'Одежда', price: 5990, emoji: '👟', desc: 'Лёгкие, на каждый день' },
  { id: 6, name: 'Худи', cat: 'Одежда', price: 3290, emoji: '🧥', desc: 'Хлопок 100%, унисекс' },
  { id: 7, name: 'Кофеварка', cat: 'Дом', price: 6490, emoji: '☕', desc: 'Капельная, 1,2 л' },
  { id: 8, name: 'Настольная лампа', cat: 'Дом', price: 1890, emoji: '💡', desc: 'Регулировка яркости' },
  { id: 9, name: 'Набор кружек', cat: 'Дом', price: 1290, emoji: '🍵', desc: '4 шт., керамика' },
  { id: 10, name: 'Блокнот и ручка', cat: 'Канцелярия', price: 590, emoji: '📓', desc: 'Твёрдая обложка, A5' }
];

const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('ru-RU') + ' ₽';
let cart = {};
try { cart = JSON.parse(localStorage.getItem('cart') || '{}'); } catch (e) { cart = {}; }
let category = 'Все';
let query = '';

function save() { try { localStorage.setItem('cart', JSON.stringify(cart)); } catch (e) {} }

function renderCategories() {
  const cats = ['Все', ...new Set(PRODUCTS.map((p) => p.cat))];
  $('#categories').innerHTML = cats
    .map((c) => `<button class="chip ${c === category ? 'active' : ''}" data-cat="${c}">${c}</button>`)
    .join('');
}

function renderProducts() {
  const list = PRODUCTS.filter((p) =>
    (category === 'Все' || p.cat === category) &&
    p.name.toLowerCase().includes(query.toLowerCase()));
  $('#products').innerHTML = list.map((p) => `
    <article class="card">
      <div class="pic">${p.emoji}</div>
      <h3>${p.name}</h3>
      <div class="desc">${p.desc}</div>
      <div class="price">${fmt(p.price)}</div>
      <button class="btn" data-add="${p.id}">В корзину</button>
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
}

function total() {
  return Object.entries(cart).reduce((s, [id, q]) => {
    const p = PRODUCTS.find((x) => x.id == id);
    return s + (p ? p.price * q : 0);
  }, 0);
}

function renderCart() {
  const ids = Object.keys(cart);
  $('#cart-count').textContent = ids.reduce((s, id) => s + cart[id], 0);
  $('#cart-total').textContent = fmt(total());
  $('#cart-items').innerHTML = ids.length
    ? ids.map((id) => {
        const p = PRODUCTS.find((x) => x.id == id);
        return `<div class="item"><div class="e">${p.emoji}</div>
          <div class="t">${p.name}<br><b>${fmt(p.price)}</b></div>
          <div class="qty"><button data-dec="${id}">−</button><span>${cart[id]}</span><button data-inc="${id}">+</button></div></div>`;
      }).join('')
    : '<p class="empty">Корзина пуста</p>';
  $('#checkout-btn').disabled = !ids.length;
  save();
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => (t.hidden = true), 2500);
}

function openCart(open) {
  $('#cart').classList.toggle('open', open);
  $('#overlay').hidden = !open;
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.dataset.cat) { category = t.dataset.cat; renderCategories(); renderProducts(); }
  if (t.dataset.add) { cart[t.dataset.add] = (cart[t.dataset.add] || 0) + 1; renderCart(); toast('Добавлено в корзину'); }
  if (t.dataset.inc) { cart[t.dataset.inc]++; renderCart(); }
  if (t.dataset.dec) { if (--cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec]; renderCart(); }
});

$('#search').addEventListener('input', (e) => { query = e.target.value; renderProducts(); });
$('#cart-btn').addEventListener('click', () => openCart(true));
$('#cart-close').addEventListener('click', () => openCart(false));
$('#overlay').addEventListener('click', () => openCart(false));
$('#clear-btn').addEventListener('click', () => { cart = {}; renderCart(); });
$('#checkout-btn').addEventListener('click', () => { $('#checkout-total').textContent = fmt(total()); $('#checkout').showModal(); });
$('#checkout-cancel').addEventListener('click', () => $('#checkout').close());
$('#checkout-form').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#checkout').close();
  cart = {};
  renderCart();
  openCart(false);
  e.target.reset();
  toast('Заказ оформлен! Мы скоро свяжемся с вами.');
});

renderCategories();
renderProducts();
renderCart();

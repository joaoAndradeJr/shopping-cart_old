function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  return section;
}

function totalAmountInCart() {
  let total = 0;
  const cartList = document.querySelector('.cart__items').childNodes;
  cartList.forEach((item) => {
    const endpoint = `https://api.mercadolibre.com/items/${item.dataset.sku}`;
    fetch(endpoint).then(response => response.json()).then((data) => {
      const { price: salePrice } = data;
      total += salePrice;
      document.querySelector('.total-price').innerText = total;
    });
  });
}

function removeProductsFromLocalStorage(id) {
  const list = Object.keys(localStorage);
  if (id === undefined) {
    list.forEach(item => localStorage.removeItem(item));
  }
  list.forEach(item => localStorage.removeItem(id) === item);
}

function cartItemClickListener(event) {
  const id = event.target.dataset.sku;
  removeProductsFromLocalStorage(id);
  event.target.remove();
  totalAmountInCart();
}

const emptyCart = document.querySelector('.empty-cart');
emptyCart.addEventListener('click', () => {
  const selected = document.querySelector('.cart__items');
  while (selected.firstChild) {
    selected.firstChild.remove();
  }
  removeProductsFromLocalStorage();
  totalAmountInCart();
});

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.dataset.sku = sku;
  // li.dataset.salePrice = salePrice;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function addItemToCart(id) {
  const endpoint = `https://api.mercadolibre.com/items/${id}`;
  fetch(endpoint).then(response => response.json()).then((data) => {
    const { id: sku, title: name, price: salePrice } = data;
    const finalItem = createCartItemElement({ sku, name, salePrice });
    const selected = document.querySelector('.cart__items');
    selected.appendChild(finalItem);
    localStorage.setItem(sku, finalItem.innerHTML);
    totalAmountInCart();
  });
}

function getProductsFromLocalStorage() {
  const itemsFromLocalStorage = Object.entries(localStorage);
  itemsFromLocalStorage.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'cart__item';
    li.innerText = item[1];
    li.dataset.sku = item[0];
    li.addEventListener('click', cartItemClickListener);
    const selected = document.querySelector('.cart__items');
    selected.appendChild(li);
    totalAmountInCart();
  });
}

function getIdFromEvent(event) {
  const id = event.target.parentElement.firstChild.innerText;
  addItemToCart(id);
}

function loadingOn() {
  const div = document.createElement('div');
  div.className = 'loading';
  div.innerText = 'loading';
  const selected = document.querySelector('.items');
  selected.appendChild(div);
  // document.querySelector('.loading').style.display = 'flex';
}

function loadingOff() {
  const selected = document.querySelector('.items');
  selected.firstChild.remove();
  // document.querySelector('.loading').style.display = 'none';
}

const loadProducts = () => {
  loadingOn();
  const endpoint = 'https://api.mercadolibre.com/sites/MLB/search?q=computador';
  fetch(endpoint).then(resp => resp.json()).then((data) => {
    const items = document.querySelector('.items');
    data.results.forEach((element) => {
      const { id: sku, title: name, thumbnail: image } = element;
      const item = createProductItemElement({ sku, name, image });
      items.appendChild(item);
      item.lastChild.addEventListener('click', getIdFromEvent);
    });
  });
  setTimeout((loadingOff), 2000);
};

window.onload = function onload() {
  loadProducts();
  totalAmountInCart();
  getProductsFromLocalStorage();
};

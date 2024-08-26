const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const productsDOM = document.querySelector(".products-center");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

import { productsData } from "/products.js";
let cart = [];
let buttonsDOM = [];

class Product {
  getProducts() {
    return productsData;
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      return (result += `
        <div class="product">
          <div class="img-container">
            <img src="${item.imageUrl}" class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">$ ${item.price}</p>
            <p class="product-title">${item.title}</p>
          </div>
          <button class="btn add-to-cart" data-id=${item.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>
        `);
    });
    productsDOM.innerHTML = result;
  }

  getAddToCartBtns() {
    const buttons = [...document.querySelectorAll(".add-to-cart")];
    buttonsDOM = buttons;

    buttons.forEach((btn) => {
      const id = +btn.dataset.id;
      const isInCart = cart.find((p) => p.id === id);
      if (isInCart) {
        btn.innerText = "in cart";
        btn.disabled = true;
      }
      btn.addEventListener("click", (e) => {
        e.target.innerText = "in cart";
        e.target.disabled = true;
        const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
        // add to cart
        cart = [...cart, addedProduct];
        // save cart to localstorage
        Storage.saveCart(cart);
        // add to cart -> this : UI
        // console.log(this);
        this.setCartValue(cart);
        // add item to cart
        this.addCartItem(addedProduct);
      });
    });
  }

  setCartValue(cart) {
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);
    cartItems.innerText = tempCartItems;
    cartTotal.innerText = `total price: ${totalPrice.toFixed(2)} $`;
  }

  addCartItem(cartItem) {
    // add item to cart
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img class="cart-item-img" src=${cartItem.imageUrl} />
            <div class="cart-item-desc">
              <h4>${cartItem.title}</h4>
              <h5>$ ${cartItem.price.toFixed(2)}</h5>
            </div>
            <div class="cart-item-conteoller">
              <i class="fas fa-chevron-up inc" data-id=${cartItem.id}></i>
              <p>1</p>
              <i class="fas fa-chevron-down dec" data-id=${cartItem.id}></i>
            </div>
            <i class="fa-regular fa-trash-can trash" data-id=${
              cartItem.id
            }></i>`;
    cartContent.appendChild(div);
  }

  setupApp() {
    cart = Storage.getCart() || [];
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    this.setCartValue(cart);
  }

  cartLogic() {
    clearCart.addEventListener("click", () => this.clearCart());
    cartContent.addEventListener("click", (e) => {
      const classList = e.target.classList;
      if (classList.contains("inc")) this.incQuantity(e);
      if (classList.contains("dec")) this.decQuantity(e);
      if (classList.contains("trash")) this.removeItem(e.target.dataset.id, e);
    });
  }

  clearCart() {
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove items of cart
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }

  incQuantity(e) {
    const addQuantity = e.target;
    const addedItem = cart.find((c) => +c.id === +addQuantity.dataset.id);
    addedItem.quantity++;
    // save localstorage
    Storage.saveCart(cart);
    // update cart item
    this.setCartValue(cart);
    // update cart item UI
    addQuantity.nextElementSibling.innerText = addedItem.quantity;
  }

  decQuantity(e) {
    const subQuantity = e.target;
    const subtracted = cart.find((c) => +c.id === +subQuantity.dataset.id);
    if (+subtracted.quantity === 1) {
      cartContent.removeChild(subQuantity.parentElement.parentElement);
      cart = cart.filter((c) => c.id !== subtracted.id);
    }
    subtracted.quantity--;
    Storage.saveCart(cart);
    this.setCartValue(cart);
    this.getSingleButton(subtracted.id);
    subQuantity.previousElementSibling.innerText = subtracted.quantity;
  }

  removeItem(id, e) {
    if (e) {
      cartContent.removeChild(e.target.parentElement);
    }
    cart = cart.filter((cItem) => +cItem.id !== +id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    // change innerText and desabled
    this.getSingleButton(id);
    return;
  }

  getSingleButton(id) {
    const button = buttonsDOM.find((btn) => +btn.dataset.id === +id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
    button.disabled = false;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Product();
  const productsData = products.getProducts();
  const ui = new UI();
  // get cart items from localstorage
  ui.setupApp();
  // show products from api to dom
  ui.displayProducts(productsData);
  ui.getAddToCartBtns(productsData);
  ui.cartLogic();
  Storage.saveProducts(productsData);
  //   console.log(productsData);
});

// cart
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
  closeModal.focus();
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

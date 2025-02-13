const products = []; // Liste des produits
let currentOrder = []; // Panier de l'utilisateur

// Fonction pour afficher les produits disponibles
const renderProducts = () => {
  const productList = document.getElementById('products-list');
  productList.innerHTML = '';

  products.forEach((product, index) => {
    productList.innerHTML += `
      <div class="product">
        <h3>${product.name}</h3>
        <p>Prix : ${product.price} €</p>
        <p>Stock : ${product.stock}</p>
        <button onclick="addToOrder(${index})">Ajouter au panier</button>
      </div>
    `;
  });
};

// Ajouter un produit au panier
const addToOrder = (index) => {
  const product = products[index];
  currentOrder.push({ ...product, quantity: 1 });
  renderOrderSummary();
};

// Afficher le résumé de commande
const renderOrderSummary = () => {
  const orderSummary = document.getElementById('order-summary');
  orderSummary.innerHTML = '';

  let total = 0;
  currentOrder.forEach((item) => {
    total += item.price * item.quantity;
    orderSummary.innerHTML += `
      <p>${item.name} x ${item.quantity} - ${item.price * item.quantity} €</p>
    `;
  });

  orderSummary.innerHTML += `<strong>Total : ${total} €</strong>`;
};

// Placer une commande
const placeOrder = () => {
  if (currentOrder.length === 0) {
    alert("Votre panier est vide !");
    return;
  }

  // Envoi de la commande à l'administrateur (via une API ou autre mécanisme de gestion)
  alert("Commande passée avec succès !");
  currentOrder = [];
  renderOrderSummary();
};

// Gestion des événements
document.getElementById('place-order').addEventListener('click', placeOrder);

// Afficher les produits (exemple de produits)
products.push({ name: 'Pain blanc', price: 2.9, stock: 5 });
products.push({ name: 'Pain gris', price: 2.9, stock: 3 });
products.push({name: 'Eclairs', price: 2.1, stock: 6});
renderProducts();
renderOrderSummary();

// Ajout d'une nouvelle catégorie
function addCategory() {
    const categoryName = document.getElementById('category-name').value;
    if (!categoryName) {
        alert('Veuillez entrer un nom pour la catégorie.');
        return;
    }

    const categoriesDiv = document.getElementById('categories');

    // Créer un conteneur pour la catégorie
    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    // Titre de la catégorie
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = categoryName;
    categoryDiv.appendChild(categoryTitle);

    // Formulaire pour ajouter un produit
    const productForm = document.createElement('div');
    productForm.classList.add('product-form');
    productForm.innerHTML = `
        <input type="text" placeholder="Nom du produit" class="product-name">
        <button onclick="addProduct(this)">Ajouter un produit</button>
    `;
    categoryDiv.appendChild(productForm);

    // Liste des produits
    const productsList = document.createElement('div');
    productsList.classList.add('products');
    categoryDiv.appendChild(productsList);

    // Ajouter la catégorie au DOM
    categoriesDiv.appendChild(categoryDiv);

    // Réinitialiser le champ de saisie
    document.getElementById('category-name').value = '';
}

// Ajout d'un produit à une catégorie spécifique
function addProduct(button) {
    const productNameInput = button.previousElementSibling;
    const productName = productNameInput.value;
    if (!productName) {
        alert('Veuillez entrer un nom pour le produit.');
        return;
    }

    // Trouver la liste des produits dans la catégorie
    const productsList = button.parentElement.nextElementSibling;

    // Créer un élément pour le produit
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    productDiv.textContent = productName;

    // Ajouter le produit à la liste
    productsList.appendChild(productDiv);

    // Réinitialiser le champ de saisie
    productNameInput.value = '';
}

// Initialisation des données depuis le LocalStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories.forEach(category => renderCategory(category));
});

// Sauvegarde les catégories dans le LocalStorage
function saveCategories() {
    const categories = Array.from(document.querySelectorAll('.category')).map(categoryDiv => {
        const categoryName = categoryDiv.querySelector('h3').textContent;
        const products = Array.from(categoryDiv.querySelectorAll('.product')).map(productDiv => productDiv.textContent);
        return { name: categoryName, products };
    });
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Ajoute une nouvelle catégorie
function addCategory() {
    const categoryName = document.getElementById('category-name').value.trim();
    if (!categoryName) {
        alert('Veuillez entrer un nom pour la catégorie.');
        return;
    }

    const newCategory = { name: categoryName, products: [] };
    renderCategory(newCategory);

    // Sauvegarder dans le LocalStorage
    saveCategories();

    document.getElementById('category-name').value = '';
}

// Affiche une catégorie
function renderCategory(category) {
    const categoriesDiv = document.getElementById('categories');

    const categoryDiv = document.createElement('div');
    categoryDiv.classList.add('category');

    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = category.name;
    categoryDiv.appendChild(categoryTitle);

    const productForm = document.createElement('div');
    productForm.classList.add('product-form');
    productForm.innerHTML = `
        <input type="text" placeholder="Nom du produit" class="product-name">
        <button onclick="addProduct(this)">Ajouter un produit</button>
    `;
    categoryDiv.appendChild(productForm);

    const productsList = document.createElement('div');
    productsList.classList.add('products');
    category.products.forEach(productName => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.textContent = productName;
        productsList.appendChild(productDiv);
    });
    categoryDiv.appendChild(productsList);

    categoriesDiv.appendChild(categoryDiv);
}

// Ajoute un produit dans une catégorie
function addProduct(button) {
    const productNameInput = button.previousElementSibling;
    const productName = productNameInput.value.trim();
    if (!productName) {
        alert('Veuillez entrer un nom pour le produit.');
        return;
    }

    const productsList = button.parentElement.nextElementSibling;

    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    productDiv.textContent = productName;

    productsList.appendChild(productDiv);

    saveCategories();

    productNameInput.value = '';
}


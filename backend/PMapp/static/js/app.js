// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register("/static/js/service-worker.js")
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration);
      })
      .catch((error) => {
        console.error('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}

// Liste des produits et commandes
const products = [];
const orders = [];
let currentOrder = [];

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
        <button onclick="deleteProduct(${index})">Supprimer</button>
      </div>
    `;
  });
};

// Ajouter un produit
const addProduct = (e) => {
  e.preventDefault();
  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value, 10);
  const description = document.getElementById('product-description').value;

  products.push({ name, price, stock, description });
  renderProducts();

  // Réinitialiser le formulaire
  e.target.reset();
};

// Supprimer un produit
const deleteProduct = (index) => {
  products.splice(index, 1);
  renderProducts();
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
  currentOrder.forEach((item, index) => {
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

  orders.push({
    id: orders.length + 1,
    products: currentOrder,
    total_price: currentOrder.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ),
    status: "En attente" // Statut initial
  });

  currentOrder = [];
  renderOrderSummary();
  renderOrders(); // Mettre à jour l'affichage des commandes
  alert("Commande passée avec succès !");
};

// Afficher les commandes
const renderOrders = () => {
  const ordersList = document.getElementById('orders-list');
  ordersList.innerHTML = '';

  const filterValue = document.getElementById('order-status-filter').value;

  const filteredOrders = filterValue === 'all'
    ? orders
    : orders.filter(order => order.status === filterValue);

  filteredOrders.forEach((order, index) => {
    ordersList.innerHTML += `
      <div class="order">
        <h3>Commande #${order.id}</h3>
        <p>Produits :</p>
        <ul>
          ${order.products
            .map(
              (item) =>
                `<li>${item.name} x ${item.quantity} - ${item.price * item.quantity} €</li>`
            )
            .join('')}
        </ul>
        <p>Total : ${order.total_price} €</p>
        <p>Statut : <strong>${order.status}</strong></p>
        <button onclick="updateOrderStatus(${index}, 'En préparation')">En préparation</button>
        <button onclick="updateOrderStatus(${index}, 'Terminée')">Terminée</button>
        <button onclick="updateOrderStatus(${index}, 'Annulée')">Annulée</button>
      </div>
    `;
  });
};

// Mettre à jour le statut de la commande
const updateOrderStatus = (index, status) => {
  orders[index].status = status;
  renderOrders(); // Mettre à jour l'affichage des commandes
};

// Vérifier si l'utilisateur est connecté et afficher le bouton de déconnexion
window.addEventListener('DOMContentLoaded', () => {
  fetch('/check-session')
  .then(response => response.json())
  .then(data => {
    if (data.logged_in) {
      // Vérifie que l'élément existe avant de modifier son style
      const logoutButton = document.getElementById('logout-btn');
      if (logoutButton) {
        logoutButton.style.display = 'inline-block';
      }
    }
  })
  .catch(error => console.error('Erreur lors de la vérification de la session:', error))
});

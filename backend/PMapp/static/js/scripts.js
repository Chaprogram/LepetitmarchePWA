document.addEventListener("DOMContentLoaded", () => {
    handleCategorySelection(); // Gestion des catégories
    updateCartCount(); // Mise à jour du nombre d'articles dans le panier
    displayCart(); // Affichage du contenu du panier
    loadProductsFromURL(); // Chargement des produits dynamiques

    // Ajout de l'écouteur pour la recherche
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchProduct);
    }
});

// 🔹 Fonction pour charger les produits en fonction de la catégorie dans l'URL
function loadProductsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get("categorie");

    if (!categorie) {
        console.error("Aucune catégorie spécifiée.");
        return;
    }

    fetch(`/produits?categorie=${categorie}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("products-container");
            if (!container) return;
            container.innerHTML = "";

            data.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Prix: ${product.price}€</p>
                    <p>Stock: ${product.stock}</p>
                    <button class="add-btn" data-name="${product.name}" data-price="${product.price}">Ajouter au panier</button>
                `;
                container.appendChild(productDiv);
            });

            // Attache les événements après le chargement des produits
            attachAddToCartEvents();
        })
        .catch(error => console.error("Erreur lors du chargement des produits :", error));
}

// 🔹 Fonction pour gérer les catégories
function handleCategorySelection() {
    const categoryButtons = document.querySelectorAll('.category-btn'); // Boutons des catégories

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.getAttribute('data-category');
            if (category) {
                window.location.href = `?categorie=${category}`;
            }
        });
    });
}

// 🔹 Fonction pour rechercher un produit
function searchProduct() {
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const allProducts = document.querySelectorAll('.product h3');

    allProducts.forEach(product => {
        const productDiv = product.parentElement;
        const productName = product.textContent.toLowerCase();
        productDiv.style.display = productName.includes(searchValue) ? 'block' : 'none';
    });
}

// 🔹 Initialisation et gestion du panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fonction pour ajouter un produit au panier
function addProductToCart(productName, productPrice) {
    const productIndex = cart.findIndex(product => product.name === productName);

    if (productIndex === -1) {
        cart.push({ name: productName, price: productPrice, quantity: 1 });
    } else {
        cart[productIndex].quantity++;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Fonction pour attacher les événements "Ajouter au panier"
function attachAddToCartEvents() {
    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productName = e.target.getAttribute("data-name");
            const productPrice = parseFloat(e.target.getAttribute("data-price"));
            addProductToCart(productName, productPrice);
        });
    });
}

// 🔹 Mise à jour du nombre d'articles dans le panier
function updateCartCount() {
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// 🔹 Affichage du contenu du panier
function displayCart() {
    const cartContainer = document.getElementById('cart-items');

    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.textContent = 'Votre panier est vide.';
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.price}€ - Quantité : ${item.quantity}`;
        cartContainer.appendChild(li);
    });
}

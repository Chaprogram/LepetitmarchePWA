// Initialisation du panier au chargement de la page
function displayCart() { 
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fonction exécutée lorsque le DOM est complètement chargé
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

    // Bouton pour ajouter un produit (uniquement pour l'admin)
    const addProductBtn = document.getElementById("add-product-btn");
    if (addProductBtn) {
        addProductBtn.addEventListener("click", () => {
            const productName = prompt("Nom du produit:");
            const productPrice = prompt("Prix du produit:");
            const productStock = prompt("Stock disponible:");

            if (productName && productPrice && productStock) {
                ajouterProduit(productName, productPrice, productStock);
            }
        });
    }
})};

// 🔹 Fonction pour charger les produits en fonction de la catégorie dans l'URL
function loadProductsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get("categorie");

    // Vérifie si la catégorie est spécifiée dans l'URL
    if (!categorie) {
        console.error("Aucune catégorie spécifiée dans l'URL.");
        return;
    }

    console.log("Catégorie extraite de l'URL :", categorie);

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

// 🔹 Initialisation et gestion du panier
function addProductToCart(productId, productName, productPrice) {
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    } else {
        cart[productIndex].quantity++;  // Incrémente la quantité si le produit est déjà dans le panier
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();  // Mise à jour du nombre d'articles
    displayCart();      // Affichage du contenu du panier
}

// Fonction pour attacher les événements "Ajouter au panier"
function attachAddToCartEvents() {
    if (document.querySelectorAll(".add-btn").length === 0) return; // Evite de réattacher les événements
    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"));
            const productName = e.target.getAttribute("data-name");
            const productPrice = parseFloat(e.target.getAttribute("data-price"));
            addProductToCart(productId, productName, productPrice);
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

// 🔹 Fonction pour ajouter un produit via API Flask (pour l'admin)
function ajouterProduit(name, price, stock) {
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get("categorie");

    fetch("/api/ajouter_produit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, stock, category: categorie })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Produit ajouté avec succès !");
            loadProductsFromURL(); // Recharge les produits dynamiquement
        } else {
            alert("Erreur lors de l'ajout du produit.");
        }
    })
    .catch(error => console.error("Erreur:", error));
}

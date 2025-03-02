document.addEventListener("DOMContentLoaded", function() {
    updateCartCount();
    loadProductsFromURL(); // Charge les produits dynamiquement
});

// Fonction pour charger les produits depuis l'URL
function loadProductsFromURL() {
    const path = window.location.pathname; // Récupère le chemin de l'URL (ex: /chocolats)
    const categorie = path.split('/').pop(); // Prend la dernière partie après le slash

    if (!categorie) {
        console.error("Aucune catégorie spécifiée dans l'URL.");
        return;
    }

    console.log("Catégorie extraite de l'URL :", categorie);

    fetch(`/api/produits?categorie=${categorie}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("products-container");
            if (!container) return;
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "Aucun produit trouvé pour cette catégorie.";
                return;
            }

            data.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Prix: ${product.price}€</p>

                    <!-- Quantité -->
                    <div class="quantity">
                        <button class="decrease" data-id="${product.id}">-</button>
                        <span class="quantity-text">1</span>
                        <button class="increase" data-id="${product.id}">+</button>
                    </div>
                    
                    <!-- Ajouter au panier -->
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Ajouter au panier</button>
                `;
                container.appendChild(productDiv);
            });
        })
        .catch(error => console.error("Erreur lors du chargement des produits :", error));
}

// Délégation des événements pour la gestion des quantités et du panier
document.addEventListener("click", function(event) {
    const target = event.target;

    // Augmenter la quantité
    if (target.classList.contains("increase")) {
        const quantitySpan = target.previousElementSibling;
        let currentQuantity = parseInt(quantitySpan.textContent);
        if (currentQuantity < 99) {
            quantitySpan.textContent = currentQuantity + 1;
        }
    }

    // Diminuer la quantité
    if (target.classList.contains("decrease")) {
        const quantitySpan = target.nextElementSibling;
        let currentQuantity = parseInt(quantitySpan.textContent);
        if (currentQuantity > 1) {
            quantitySpan.textContent = currentQuantity - 1;
        }
    }

    // Ajouter au panier
    if (target.classList.contains("add-to-cart")) {
        const productId = parseInt(target.getAttribute("data-id"));
        const productName = target.getAttribute("data-name");
        const productPrice = parseFloat(target.getAttribute("data-price"));
        const quantityElement = target.closest(".product").querySelector(".quantity-text");

        // Sécurité : Si l'élément quantity-text est trouvé, on récupère sa valeur. Sinon, on définit la quantité par défaut (1)
        const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;

        addProductToCart(productId, productName, productPrice, quantity);
    }
});

// Fonction pour ajouter un produit au panier
function addProductToCart(productId, productName, productPrice, quantity) {
    // Récupère le panier du localStorage ou un tableau vide si le panier n'existe pas
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Cherche si le produit existe déjà dans le panier
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        // Si le produit n'existe pas encore dans le panier, on l'ajoute
        cart.push({ id: productId, name: productName, price: productPrice, quantity: quantity });
    } else {
        // Si le produit existe déjà, on incrémente la quantité
        cart[productIndex].quantity += quantity;
    }

    // Sauvegarde le panier mis à jour dans le localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Mise à jour du nombre d'articles dans le panier
    updateCartCount();
}

// Mise à jour du nombre d'articles dans le panier
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

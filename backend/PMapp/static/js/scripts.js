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
        const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1; // Sécurité

        addProductToCart(productId, productName, productPrice, quantity);
    }
});

// Fonction pour ajouter un produit au panier
function addProductToCart(productId, productName, productPrice, quantity) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: quantity });
    } else {
        cart[productIndex].quantity += quantity; // Incrémente la quantité si le produit est déjà dans le panier
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(); // Mise à jour du nombre d'articles
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


const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Vérifier si le produit est déjà dans le panier
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Sauvegarde le panier dans le localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Produit ajouté au panier:', product);
};

// Écouter le clic sur tous les boutons "Ajouter au panier"
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productDiv = e.target.closest('.product');
        if (!productDiv) return;

        const priceElement = productDiv.querySelector('.price');
        if (!priceElement) {
            console.error("Élément prix non trouvé dans :", productDiv.innerHTML);
            return;
        }

        const product = {
            id: parseInt(e.target.dataset.id, 10),
            name: productDiv.querySelector('h3').textContent.trim(),
            price: parseFloat(priceElement.textContent.replace('Prix: ', '').replace('€', '').trim()),
        };

        addToCart(product);
    }
});


// Fonction pour ajouter un produit au panier avec la quantité choisie
function addProductToCart(productId, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        // Ajoute le produit avec la quantité sélectionnée
        cart.push({ id: productId, quantity: quantity });
    } else {
        // Si le produit est déjà dans le panier, incrémente sa quantité
        cart[productIndex].quantity += quantity;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Fonction pour attacher les événements "Ajouter au panier"
function attachAddToCartEvents() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"));
            const quantity = parseInt(e.target.previousElementSibling.querySelector('.quantity-text').textContent);
            addProductToCart(productId, quantity);  // Envoie la quantité choisie
        });
    });
}

// Fonction pour gérer l'ajustement de la quantité
function attachQuantityEvents() {
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const quantitySpan = e.target.previousElementSibling;
            let currentQuantity = parseInt(quantitySpan.textContent);
            if (currentQuantity < 99) {  // Limiter à 99 produits
                quantitySpan.textContent = currentQuantity + 1;
            }
        });
    });

    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const quantitySpan = e.target.nextElementSibling;
            let currentQuantity = parseInt(quantitySpan.textContent);
            if (currentQuantity > 1) {  // Ne pas descendre en dessous de 1
                quantitySpan.textContent = currentQuantity - 1;
            }
        });
    });
}

// Fonction pour mettre à jour le nombre d'articles dans le panier
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Fonction pour afficher le contenu du panier dans la console (optionnel)
function displayCart() {
    console.log("Panier mis à jour :", JSON.parse(localStorage.getItem('cart')) || []);
}

// Lancer la fonction après le chargement de la page
document.addEventListener("DOMContentLoaded", loadProductsFromURL);


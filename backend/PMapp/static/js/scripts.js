// Fonction pour ajouter un produit au panier
function addProductToCart(productId, productName, productPrice) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
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

// Mise à jour du nombre d'articles dans le panier
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

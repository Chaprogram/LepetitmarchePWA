function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Contenu du panier:", cart);  // Ajout pour débogage

    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartList || !cartTotal) {
        console.warn("Les éléments du panier ne sont pas présents sur cette page.");
        return;
    }

    cartList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartList.innerHTML = '<p>Votre panier est vide.</p>';
        cartTotal.textContent = '0.00 €';
        return;
    }

    cart.forEach((product) => {
        console.log(`Produit: ${product.name}, Prix: ${product.price}, Quantité: ${product.quantity}`); // Ajout de logs

        // Vérification de la validité des données
        if (!product.price || !product.quantity || isNaN(product.price) || isNaN(product.quantity)) {
            console.warn(`Données incorrectes pour ${product.name}`, product);
            return;
        }

        const itemLi = document.createElement('li');
        itemLi.classList.add('cart-item');
        const itemPrice = (parseFloat(product.price) * parseInt(product.quantity)).toFixed(2);

        itemLi.innerHTML = `
            <span class="item-name">${product.name}</span>
            <span class="item-quantity">Quantité : ${product.quantity}</span>
            <span class="item-price">${itemPrice}€</span>
            <button class="remove-btn" data-name="${product.name}">Supprimer</button>
        `;
        cartList.appendChild(itemLi);

        total += parseFloat(itemPrice); // Additionner le prix total des produits
    });

    console.log("Total calculé:", total.toFixed(2)); // Ajout pour voir le total calculé
    cartTotal.textContent = `${total.toFixed(2)} €`;

    attachRemoveHandlers();
}

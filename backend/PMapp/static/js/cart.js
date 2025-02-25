// Vérifier et afficher le panier
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Contenu du panier dans localStorage :', cart);
    
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartList || !cartTotal) {
        console.warn("Les éléments du panier ne sont pas présents sur cette page.");
        return;
    }

    // Vider l'affichage avant de le remplir
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p>Votre panier est vide.</p>';
        cartTotal.textContent = '0.00 €';
        return;
    }

    let total = 0;

    cart.forEach((product) => {
        const itemLi = document.createElement('li');
        itemLi.classList.add('cart-item');
        itemLi.innerHTML = `
            <span class="item-name">${product.name}</span>
            <span class="item-quantity">Quantité : ${product.quantity}</span>
            <span class="item-price">${(product.price * product.quantity).toFixed(2)}€</span>
            <button class="remove-btn" data-name="${product.name}">Supprimer</button>
        `;
        cartList.appendChild(itemLi);

        total += product.quantity * product.price;
    });

    cartTotal.textContent = `${total.toFixed(2)} €`;

    attachRemoveHandlers(); // Ajoute les événements pour les boutons "Supprimer"
}

// Supprimer un produit du panier
function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter((item) => item.name !== productName);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Attacher les événements aux boutons "Supprimer"
function attachRemoveHandlers() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach((button) => {
        button.removeEventListener('click', handleRemove);
        button.addEventListener('click', handleRemove);
    });
}

// Gestionnaire de suppression d'un produit
function handleRemove(event) {
    const productName = event.target.getAttribute('data-name');
    removeFromCart(productName);
}

// Vider complètement le panier
function clearCart() {
    localStorage.removeItem('cart');
    displayCart();
    alert('Le panier a été vidé.');
}

// Activer les options de livraison et paiement
function manageDeliveryOptions() {
    document.getElementById('payment-form')?.classList.remove('hidden');
    displayPaymentOptions(['Cash', 'Payconiq']);
}

// Affichage dynamique des moyens de paiement
function displayPaymentOptions(options) {
    const paymentOptions = document.getElementById('payment-options');
    if (!paymentOptions) return;

    paymentOptions.innerHTML = '';

    options.forEach((option) => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="payment-method" value="${option}"> ${option}`;
        paymentOptions.appendChild(label);
    });
}

// Validation et envoi de la commande
function handleOrderSubmission() {
    const submitOrderButton = document.getElementById('submit-order');

    if (!submitOrderButton) return;

    submitOrderButton.addEventListener("click", function () {
        const deliveryAddress = document.getElementById('delivery-address')?.value;
        const deliveryDate = document.getElementById('delivery-date')?.value;
        const deliveryTime = document.getElementById('delivery-time')?.value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

        if (!deliveryAddress || !deliveryDate || !deliveryTime) {
            alert('Veuillez remplir toutes les informations pour la livraison.');
            return;
        }

        if (!paymentMethod) {
            alert('Veuillez choisir une méthode de paiement.');
            return;
        }

        const orderDetails = {
            method: 'Livraison',
            address: deliveryAddress,
            date: deliveryDate,
            time: deliveryTime,
            paymentMethod: paymentMethod.value
        };

        alert(`Commande validée avec succès.\nDétails : ${JSON.stringify(orderDetails)}`);
        clearCart();
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    manageDeliveryOptions();
    handleOrderSubmission();

    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }
});

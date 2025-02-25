// Fonction pour afficher les produits dans le panier
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
        cartTotal.textContent = '0.00 €'; // Total vide
        return;
    }

    let total = 0;

    cart.forEach((product) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <div class="item-name">${product.name}</div>
            <div class="item-quantity">Quantité : ${product.quantity}</div>
            <div class="item-price">${(product.price * product.quantity).toFixed(2)}€</div>
            <button class="remove-btn" data-name="${product.name}">Supprimer</button>
        `;
        cartList.appendChild(itemDiv);

        // Ajout au total
        total += product.quantity * product.price;
    });

    cartTotal.textContent = `${total.toFixed(2)} €`; // Affiche le total
    attachRemoveHandlers(); // Ajoute les gestionnaires d'événements pour les boutons "Supprimer"
}

// Fonction pour supprimer un produit du panier
function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter((item) => item.name !== productName); // Supprime le produit
    localStorage.setItem('cart', JSON.stringify(cart)); // Sauvegarde les modifications
    displayCart(); // Rafraîchit l'affichage
}

// Attache les gestionnaires aux boutons "Supprimer"
function attachRemoveHandlers() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach((button) => {
        button.removeEventListener('click', handleRemove); // Éviter les gestionnaires dupliqués
        button.addEventListener('click', handleRemove); // Ajouter un gestionnaire
    });
}

// Gestionnaire pour supprimer un produit
function handleRemove(event) {
    const productName = event.target.getAttribute('data-name');
    removeFromCart(productName);
}

// Fonction pour vider le panier
function clearCart() {
    localStorage.removeItem('cart'); // Supprime tous les produits du stockage local
    displayCart(); // Recharge l'affichage du panier (vide)
    alert('Le panier a été vidé.');
}

// Gestion des options de livraison (uniquement livraison)
// Gestion des options de livraison (uniquement livraison)
function manageDeliveryOptions() {
    const deliveryForm = document.getElementById('delivery-form');
    const paymentForm = document.getElementById('payment-form');

    if (!deliveryForm || !paymentForm) {
        console.warn("Les formulaires de livraison ou de paiement sont introuvables.");
        return;
    }

    // Afficher directement le formulaire de livraison et paiement
    deliveryForm?.classList.remove('hidden'); // Affiche le formulaire de livraison
    paymentForm?.classList.remove('hidden'); // Affiche le formulaire de paiement

    // Afficher les options de paiement disponibles pour la livraison
    displayPaymentOptions(['Cash', 'Payconiq']);
}

// Afficher les options de paiement dynamiquement
function displayPaymentOptions(options) {
    const paymentOptions = document.getElementById('payment-options');
    if (!paymentOptions) {
        console.warn("Section des options de paiement introuvable.");
        return;
    }

    paymentOptions.innerHTML = ''; // Vider les options précédentes

    options.forEach((option) => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="radio" name="payment-method" value="${option}">
            ${option}
        `;
        paymentOptions.appendChild(label);
    });
}

// Gestion du bouton "Valider la commande"
function handleOrderSubmission() {
    const submitOrderButton = document.getElementById('submit-order');

    if (!submitOrderButton) {
        console.warn("Bouton valider-commande introuvable.");
        return;
    }

    submitOrderButton.addEventListener("click", function () {
        const deliveryAddress = document.getElementById('delivery-address')?.value;
        const deliveryTime = document.getElementById('delivery-time')?.value;
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

        // Vérifications des informations saisies
        if (!deliveryAddress || !deliveryTime) {
            alert('Veuillez remplir toutes les informations pour la livraison.');
            return;
        }

        if (!paymentMethod) {
            alert('Veuillez choisir une méthode de paiement.');
            return;
        }

        const details = {
            method: 'Livraison',
            address: deliveryAddress,
            time: deliveryTime,
            paymentMethod: paymentMethod.value
        };

        alert(`Commande validée avec succès.\nDétails : ${JSON.stringify(details)}`);
        clearCart(); // Vide le panier après validation
    });
}

// Envoi de l'email de confirmation
function sendConfirmationEmail(userEmail, orderDetails) {
    fetch('/send_confirmation_email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, order_details: orderDetails })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert("E-mail de confirmation envoyé !");
        } else {
            alert("Erreur lors de l'envoi de l'e-mail : " + data.error);
        }
    })
    .catch(error => console.error("Erreur :", error));
}

// Initialisation après chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    manageDeliveryOptions(); // Affiche uniquement la section livraison
    handleOrderSubmission();

    const clearCartButton = document.getElementById('clear-cart');
    if (clearCartButton) {
        clearCartButton.addEventListener('click', clearCart);
    }
});


document.addEventListener("DOMContentLoaded", function () {
    function updateTotal() {
        let total = 0;
        document.querySelectorAll("#cart-items tr").forEach(row => {
            let priceText = row.querySelector(".item-price").textContent.trim();
            let price = parseFloat(priceText.replace("€", "").replace(",", "."));
            let quantity = parseInt(row.querySelector(".item-quantity").value);
            let itemTotal = price * quantity;

            row.querySelector(".item-total").textContent = itemTotal.toFixed(2) + "€";
            total += itemTotal;
        });

        document.getElementById("total-price").textContent = total.toFixed(2) + "€";
    }

    // Mettre à jour le total lorsqu'on change une quantité
    document.querySelectorAll(".item-quantity").forEach(input => {
        input.addEventListener("input", updateTotal);
    });

    // Calculer le total au chargement de la page
    updateTotal();
});

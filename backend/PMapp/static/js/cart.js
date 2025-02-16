// Fonction pour afficher les produits dans le panier
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Contenu du panier dans localStorage :', cart);
    const cartList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartList) {
        console.warn("L'élément cart-items est introuvable.");
        return;
    }

    // Vider l'affichage avant de le remplir
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartList.innerHTML = '<p>Votre panier est vide.</p>';
        if (cartTotal) cartTotal.textContent = '0.00 €'; // Total vide
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

    if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} €`; // Affiche le total
    attachRemoveHandlers(); // Ajoute les gestionnaires d'événements pour les boutons "Supprimer"
}

// Fonction pour ajouter un produit au panier
function addProductToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find((item) => item.name === product.name);

    if (existingProduct) {
        console.log(`Produit existant trouvé : ${existingProduct.name}`); // Debug
        existingProduct.quantity += product.quantity;
    } else {
        console.log(`Ajout d'un nouveau produit : ${product.name}`); // Debug
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart(); // Mettre à jour l'affichage
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

// Gestion des options de retrait/livraison
function manageDeliveryOptions() {
    const pickupOption = document.getElementById('pickup-option');
    const deliveryOption = document.getElementById('delivery-option');
    const pickupForm = document.getElementById('pickup-form');
    const deliveryForm = document.getElementById('delivery-form');
    const paymentForm = document.getElementById('payment-form');

    if (pickupOption && deliveryOption) {
        pickupOption.addEventListener('change', () => {
            if (pickupOption.checked) {
                pickupForm.classList.remove('hidden');
                deliveryForm.classList.add('hidden');
                paymentForm.classList.remove('hidden');
                displayPaymentOptions(['Payconiq', 'Paiement en magasin']);
            }
        });

        deliveryOption.addEventListener('change', () => {
            if (deliveryOption.checked) {
                deliveryForm.classList.remove('hidden');
                pickupForm.classList.add('hidden');
                paymentForm.classList.remove('hidden');
                displayPaymentOptions(['Cash', 'Payconiq']);
            }
        });
    } else {
        console.warn("Les options de livraison/retrait ne sont pas présentes sur cette page.");
    }
}

// Afficher les options de paiement dynamiquement
function displayPaymentOptions(options) {
    const paymentOptions = document.getElementById('payment-options');
    if (!paymentOptions) {
        console.warn("L'élément payment-options est introuvable.");
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
    if (submitOrderButton) {
        submitOrderButton.addEventListener('click', () => {
            const method = document.querySelector('input[name="delivery-option"]:checked');
            const paymentMethod = document.querySelector('input[name="payment-method"]:checked');

            if (!method) {
                alert('Veuillez choisir une option de retrait ou de livraison.');
                return;
            }

            if (!paymentMethod) {
                alert('Veuillez choisir une méthode de paiement.');
                return;
            }

            let details = {};

            if (method.id === 'pickup-option') {
                const name = document.getElementById('pickup-name').value;
                const date = document.getElementById('pickup-date').value;

                if (!name || !date) {
                    alert('Veuillez remplir toutes les informations pour le retrait.');
                    return;
                }

                details = { method: 'Retrait en magasin', name, date, paymentMethod: paymentMethod.value };
            } else if (method.id === 'delivery-option') {
                const address = document.getElementById('delivery-address').value;
                const time = document.getElementById('delivery-time').value;

                if (!address || !time) {
                    alert('Veuillez remplir toutes les informations pour la livraison.');
                    return;
                }

                details = { method: 'Livraison', address, time, paymentMethod: paymentMethod.value };
            }

            alert(`Commande validée avec succès.\nDétails : ${JSON.stringify(details)}`);
            clearCart(); // Vide le panier après validation
        });
    } else {
        console.warn("Bouton submit-order introuvable.");
    }
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

    const validerCommandeBtn = document.getElementById("valider-commande");
    if (validerCommandeBtn) {
        validerCommandeBtn.addEventListener("click", function() {
            let email = document.getElementById("email-client").value;
            let orderDetails = "Détails de ta commande ici..."; // À remplacer par les vrais détails

            sendConfirmationEmail(email, orderDetails);
        });
    } else {
        console.warn("Bouton valider-commande introuvable.");
    }
});

function sendConfirmationEmail(userEmail, orderDetails) {
    fetch('/send_confirmation_email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userEmail,
            order_details: orderDetails
        })
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

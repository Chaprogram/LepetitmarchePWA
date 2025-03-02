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

function attachRemoveHandlers() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-name');
            removeProductFromCart(productName);
        });
    });
}

function removeProductFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(product => product.name !== productName); // Filtrer le produit à supprimer
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart(); // Réafficher le panier
}


document.addEventListener("DOMContentLoaded", function () {
    let paymentOptions = document.querySelectorAll("input[name='payment-method']");
    let payconiqQrDiv = document.getElementById("payconiq-qr");
    let payconiqImage = document.getElementById("payconiq-image");

    // Fonction pour recalculer le total en tenant compte des produits
    function getCartTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;
        cart.forEach(product => {
            total += parseFloat(product.price) * parseInt(product.quantity);
        });
        return total;
    }

    paymentOptions.forEach(option => {
        option.addEventListener("change", function () {
            if (this.value === "payconiq") {
                // Affiche le QR code Payconiq
                payconiqQrDiv.style.display = "block";
                payconiqImage.src = "/generate_payconiq_qr"; // URL pour générer le QR
            } else {
                // Cache le QR code
                payconiqQrDiv.style.display = "none";
            }
        });
    });

    document.getElementById("submit-order").addEventListener("click", function () {
        let cartTotal = getCartTotal(); // Récupère le total du panier

        if (cartTotal < 25) {
            alert("Le montant minimum pour valider la commande est de 25 €.");
            return; // Empêche la soumission de la commande si le total est inférieur à 25 €
        }

        let selectedPayment = document.querySelector("input[name='payment-method']:checked").value;
        let deliveryAddress = document.getElementById("delivery-address").value;
        let deliveryDate = document.getElementById("delivery-date").value;
        let deliveryTime = document.getElementById("delivery-time").value;

        if (!deliveryAddress) {
            alert("Veuillez entrer une adresse de livraison.");
            return;
        }

        let orderData = {
            payment_method: selectedPayment,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime
        };

        fetch("/submit_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Commande validée !");
                window.location.href = "/confirmation";
            } else {
                alert("Erreur lors de la commande.");
            }
        });
    });
});


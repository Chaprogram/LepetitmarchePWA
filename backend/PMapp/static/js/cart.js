document.addEventListener("DOMContentLoaded", function () {
    let paymentOptions = document.querySelectorAll("input[name='payment-method']");
    let payconiqQrDiv = document.getElementById("payconiq-qr");
    let payconiqImage = document.getElementById("payconiq-image");

    // Fonction pour recalculer le total en tenant compte des produits récupérés depuis le backend
    function getCartTotal() {
        let total = 0;
        let cartItems = document.querySelectorAll(".cart-item"); // Sélectionne les produits affichés dans le panier
        cartItems.forEach(item => {
            let price = parseFloat(item.getAttribute("data-price"));
            let quantity = parseInt(item.getAttribute("data-quantity"));
            
            // Vérifier que le prix et la quantité sont valides
            if (isNaN(price) || isNaN(quantity)) {
                console.error("Prix ou quantité invalide pour un produit.");
                return;
            }
            total += price * quantity;
        });
        return total;
    }

    paymentOptions.forEach(option => {
        option.addEventListener("change", function () {
            if (this.value === "payconiq") {
                payconiqQrDiv.style.display = "block";
                payconiqImage.src = "/generate_payconiq_qr"; // URL pour générer le QR
            } else {
                payconiqQrDiv.style.display = "none";
            }
        });
    });

    // Fonction pour envoyer la commande au backend
    document.getElementById("submit-order").addEventListener("click", function () {
        let cartTotal = getCartTotal();
        console.log("Total du panier :", cartTotal); // Vérification du total

        // Vérification du montant minimum de commande
        if (cartTotal < 25) {
            alert("Le montant minimum pour valider la commande est de 25 €.");
            return;
        }

        // Condition pour livraison gratuite à partir de 85€
        if (cartTotal >= 85) {
            alert("Félicitations ! La livraison est gratuite.");
        }

        let selectedPayment = document.querySelector("input[name='payment-method']:checked")?.value;
        let deliveryName = document.getElementById("delivery-name")?.value;
        let deliveryPostalCode = document.getElementById("delivery-postal-code")?.value;
        let deliveryEmail = document.getElementById("delivery-email")?.value;
        let deliveryPhone = document.getElementById("delivery-phone")?.value;
        let deliveryAddress = document.getElementById("delivery-address")?.value;
        let deliveryDate = document.getElementById("delivery-date")?.value;
        let deliveryTime = document.getElementById("delivery-time")?.value;

        if (!deliveryName || !deliveryPostalCode || !deliveryEmail || !deliveryPhone || !deliveryAddress) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        let orderData = {
            client_name: deliveryName,
            postal_code: deliveryPostalCode,
            email: deliveryEmail,
            phone_number: deliveryPhone,
            payment_method: selectedPayment,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime
        };

        console.log("Données envoyées au serveur :", orderData);

        fetch("/submit_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur :", data);
            if (data.success) {
                alert("Commande validée !");
                window.location.href = "/confirmation";
            } else {
                alert("Erreur lors de la commande.");
            }
        });
    });

    let clearCartButton = document.getElementById("clear-cart");
    if (clearCartButton) {
        clearCartButton.addEventListener("click", function () {
            // Vide visuellement le panier
            document.getElementById("cart-items").innerHTML = ""; 
            document.getElementById("cart-total").textContent = "0€"; 

            // Réinitialise les données du panier dans le backend
            fetch("/clear_cart", { method: "POST" }) // Envoie une requête POST pour vider le panier côté serveur
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Votre panier a été vidé.");
                    } else {
                        alert("Erreur lors de la suppression du panier.");
                    }
                });
        });
    }

    function updateCart(cart) {
        // Cette fonction est responsable de la mise à jour du DOM avec les nouveaux éléments du panier
        let cartItemsContainer = document.getElementById("cart-items");
        cartItemsContainer.innerHTML = ''; // Vide l'affichage des éléments

        // Ajoute les éléments du panier récupérés depuis le backend
        cart.forEach(product => {
            let li = document.createElement('li');
            li.classList.add('cart-item');
            li.setAttribute('data-price', product.price);
            li.setAttribute('data-quantity', product.quantity);
            li.innerHTML = `
                <span>${product.name}</span>
                <span>Quantité : ${product.quantity}</span>
                <span>${(product.price * product.quantity).toFixed(2)}€</span>
            `;
            cartItemsContainer.appendChild(li);
        });

        // Recalcule et met à jour le total
        document.getElementById("cart-total").textContent = getCartTotal().toFixed(2) + "€";
    }
});

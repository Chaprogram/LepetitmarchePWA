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

    document.getElementById("submit-order").addEventListener("click", function () {
        let cartTotal = getCartTotal();

        if (cartTotal < 25) {
            alert("Le montant minimum pour valider la commande est de 25 €.");
            return;
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
            document.getElementById("cart-items").innerHTML = ""; // Vide l'affichage
            document.getElementById("cart-total").textContent = "0€"; // Remet le total à 0
            alert("Votre panier a été vidé.");
        });
    }
});

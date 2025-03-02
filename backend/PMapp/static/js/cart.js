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
        let deliveryName = document.getElementById("delivery-name").value;
        let deliveryPostalCode = document.getElementById("delivery-postal-code").value;
        let deliveryEmail = document.getElementById("delivery-email").value;
        let deliveryPhone = document.getElementById("delivery-phone").value;  // Ajout du téléphone
        let deliveryAddress = document.getElementById("delivery-address").value;
        let deliveryDate = document.getElementById("delivery-date").value;
        let deliveryTime = document.getElementById("delivery-time").value;

        // Vérification des champs requis
        if (!deliveryName || !deliveryPostalCode || !deliveryEmail || !deliveryPhone || !deliveryAddress) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        let orderData = {
            client_name: deliveryName,
            postal_code: deliveryPostalCode,
            email: deliveryEmail,
            phone_number: deliveryPhone,  // Ajout du téléphone
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

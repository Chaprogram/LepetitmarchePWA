document.addEventListener("DOMContentLoaded", function () { 
    let paymentOptions = document.querySelectorAll("input[name='payment-method']");
    let payconiqQrDiv = document.getElementById("payconiq-qr");
    let payconiqImage = document.getElementById("payconiq-image");

    // Fonction pour recalculer le total
    function getCartTotal() {
        let total = 0;
        let cartItems = document.querySelectorAll("#cart-items li");
        cartItems.forEach(function(item){ 
            let quantity = parseInt(item.querySelector(".quantity").textContent.split(":")[1].trim());
            let price = parseFloat(item.querySelector(".price").textContent.split("€")[0].trim());
        
            // Vérifie que le prix et la quantité sont valides
            if (isNaN(price) || isNaN(quantity)) {
                console.error("Prix ou quantité invalide pour un produit.");
                return;
            }
            total += price * quantity;
        });
    
        return total;
    }

    // Écouter le changement du mode de paiement
    paymentOptions.forEach(option => {
        option.addEventListener("change", function () {
            if (this.value === "payconiq") {
                payconiqQrDiv.style.display = "block";
                payconiqImage.src = "/generate_payconiq_qr"; 
            } else {
                payconiqQrDiv.style.display = "none";
            }
        });
    });

    // Soumettre la commande
    document.getElementById("submit-order").addEventListener("click", function (e) {
        let cartTotal = getCartTotal();
        if (cartTotal < 25) {
            alert("Le montant minimum pour valider la commande est de 25 €.");
            return;
        }

        if (cartTotal >= 85) {
            alert("Félicitations ! La livraison est gratuite.");
        }

        // Collecter les informations de commande
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

        if (!deliveryDate || !deliveryTime) {
            alert("Veuillez sélectionner une date et une heure de livraison.");
            return;
        }

        // Remplir le tableau des produits
        let items = [];
        let cartItems = document.querySelectorAll("#cart-items li");
        cartItems.forEach(function(item) {
            let productId = item.dataset.productId;  // Assurez-vous d'avoir un data-product-id
            let quantity = parseInt(item.querySelector(".quantity").textContent.split(":")[1].trim());
            let price = parseFloat(item.querySelector(".price").textContent.split("€")[0].trim());

            if (!isNaN(price) && !isNaN(quantity)) {
                items.push({
                    product_id: productId,
                    quantity: quantity,
                    price: price
                });
            }
        });

        // Créer l'objet de données à envoyer
        const OrderData = {
            client_name: deliveryName,
            postal_code: deliveryPostalCode,
            email: deliveryEmail,
            phone_number: deliveryPhone,
            payment_method: selectedPayment,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            cart_items: items  // Assurez-vous d'utiliser 'cart_items' ici
        };

        console.log("Données envoyées au serveur :", OrderData);

        fetch("/submit_order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(OrderData)
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
});

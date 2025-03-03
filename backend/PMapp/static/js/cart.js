document.addEventListener("DOMContentLoaded", function () { 
    let paymentOptions = document.querySelectorAll("input[name='payment-method']");
    let payconiqQrDiv = document.getElementById("payconiq-qr");
    let payconiqImage = document.getElementById("payconiq-image");

    // Fonction pour recalculer le total en tenant compte des produits récupérés depuis le backend
    function getCartTotal() {
        let total = 0;
        let cartItems = document.querySelectorAll("#cart-items li"); // Sélectionne les produits affichés dans le panier
        cartItems.forEach(function(item){ 
            let quantity = parseInt(item.querySelector(".quantity").textContent.split(":")[1].trim()); // Récupère la quantité
            let price = parseFloat(item.querySelector(".price").textContent.split("€")[0].trim()); // Récupère le prix
        
            console.log("Produit : ", item, "Prix : ", price, "Quantité : ", quantity); // Ajout du débogage
        
            // Vérifie que le prix et la quantité sont valides
            if (isNaN(price) || isNaN(quantity)) {
                console.error("Prix ou quantité invalide pour un produit.");
                return;
            }
            total += price * quantity;
        });
    
        console.log("Total recalculé du panier : ", total); // Ajoute un log pour afficher le total recalculé
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
    document.getElementById("submit-order").addEventListener("click", function (e) {
        let cartTotal = getCartTotal();
        console.log("Total du panier :", cartTotal); // Vérification du total

        // Vérification du montant minimum de commande
        console.log("Total du panier avant validation : ", cartTotal);
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

// Vérification des champs obligatoires
if (!deliveryName || !deliveryPostalCode || !deliveryEmail || !deliveryPhone || !deliveryAddress) {
    alert("Veuillez remplir tous les champs.");
    return;
}

// Ajouter une validation pour vérifier que la date et l'heure de livraison sont sélectionnées
if (!deliveryDate || !deliveryTime) {
    alert("Veuillez sélectionner une date et une heure de livraison.");
    return;
}

// Affichage des informations dans la console pour vérification
console.log("Nom du client :", deliveryName);
console.log("Code postal :", deliveryPostalCode);
console.log("Email :", deliveryEmail);
console.log("Téléphone :", deliveryPhone);
console.log("Adresse :", deliveryAddress);
console.log("Date de livraison :", deliveryDate);
console.log("Heure de livraison :", deliveryTime);
console.log("Mode de paiement :", selectedPayment);

        let OrderData = {
            client_name: deliveryName,
            postal_code: deliveryPostalCode,
            email: deliveryEmail,
            phone_number: deliveryPhone,
            payment_method: selectedPayment,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            delivery_time: deliveryTime,
            cart_items: items
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

    // Fonction pour mettre à jour le total dans l'élément HTML
    function updateCartTotal() {
        let total = getCartTotal(); // Récupère le total recalculé
        document.getElementById("cart-total").textContent = total.toFixed(2) + "€"; // Met à jour l'affichage
    }// Si la fonction `getCartTotal()` est appelée dans plusieurs endroits, assure-toi de la gérer correctement :
document.getElementById("clear-cart").addEventListener("click", function () {
    // Recalcul du total après vidage du panier
    updateCartTotal(); 
});
});

document.addEventListener("DOMContentLoaded", function () {
    const products = document.querySelectorAll(".product");
    const totalPriceElement = document.getElementById("total-price");

    function updateTotal() {
        let total = 0;
        products.forEach(p => {
            const quantity = parseInt(p.querySelector(".quantity").textContent);
            const unitPrice = parseFloat(p.getAttribute("data-price"));
            total += quantity * unitPrice;
        });
        totalPriceElement.textContent = total.toFixed(2) + "€";
    }

    products.forEach(product => {
        const increaseButton = product.querySelector(".increase");
        const decreaseButton = product.querySelector(".decrease");
        const quantityElement = product.querySelector(".quantity");
        const productId = product.dataset.productId; // Récupère l'ID unique du produit
        const hiddenInput = document.getElementById(`quantity_${productId}`); // Associe l'input caché

        let quantity = 0;

        // ➕ Augmenter la quantité
        increaseButton.addEventListener("click", function () {
            quantity++;
            quantityElement.textContent = quantity;
            if (hiddenInput) hiddenInput.value = quantity; // Met à jour l'input caché
            updateTotal();
        });

        // ➖ Diminuer la quantité (min 0)
        decreaseButton.addEventListener("click", function () {
            if (quantity > 0) {
                quantity--;
                quantityElement.textContent = quantity;
                if (hiddenInput) hiddenInput.value = quantity;
                updateTotal();
            }
        });
    });
});



// static/js/reservation_submit.js

document.addEventListener('DOMContentLoaded', function() {
    alert('Merci pour votre réservation ! Vous recevrez bientôt un e-mail de confirmation.');
});

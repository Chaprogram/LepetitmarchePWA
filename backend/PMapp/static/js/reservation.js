document.addEventListener("DOMContentLoaded", function () {
    const products = document.querySelectorAll(".product");
    const totalPriceElement = document.getElementById("total-price");

    // Fonction pour mettre à jour le total
    function updateTotal() {
        let total = 0;
        products.forEach(p => {
            const quantity = parseInt(p.querySelector(".quantity").textContent);
            const unitPrice = parseFloat(p.getAttribute("data-price"));
            total += quantity * unitPrice;
        });
        totalPriceElement.textContent = total.toFixed(2) + "€";
    }

    // Gestion des boutons de chaque produit
    products.forEach(product => {
        const increaseButton = product.querySelector(".increase");
        const decreaseButton = product.querySelector(".decrease");
        const quantityElement = product.querySelector(".quantity");
        const hiddenInput = product.querySelector("input[type='hidden']"); // ✅ Récupère l'input caché directement
        const pricePerUnit = parseFloat(product.getAttribute("data-price"));
        let quantity = 0;

        // ➕ Augmenter la quantité
        increaseButton.addEventListener("click", function () {
            quantity++;
            quantityElement.textContent = quantity;
            if (hiddenInput) hiddenInput.value = quantity; // ✅ Met à jour l'input caché
            updateTotal();
        });

        // ➖ Diminuer la quantité (min 0)
        decreaseButton.addEventListener("click", function () {
            if (quantity > 0) {
                quantity--;
                quantityElement.textContent = quantity;
                if (hiddenInput) hiddenInput.value = quantity; // ✅ Met à jour l'input caché
                updateTotal();
            }
        });
    });
});

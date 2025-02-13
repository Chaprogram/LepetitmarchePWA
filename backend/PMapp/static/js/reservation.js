document.addEventListener("DOMContentLoaded", function () {
    // Sélectionne tous les produits
    const products = document.querySelectorAll(".product");

    products.forEach(product => {
        let quantityElement = product.querySelector(".quantity");
        let increaseButton = product.querySelector(".increase");
        let decreaseButton = product.querySelector(".decrease");

        let quantity = 0; // Initialisation à 0

        // ➕ Augmenter la quantité
        increaseButton.addEventListener("click", function () {
            quantity++;
            quantityElement.textContent = quantity;
        });

        // ➖ Diminuer la quantité (min 0)
        decreaseButton.addEventListener("click", function () {
            if (quantity > 0) {
                quantity--;
                quantityElement.textContent = quantity;
            }
        });
    
    });

});


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


document.addEventListener("DOMContentLoaded", function () {
    const products = document.querySelectorAll(".product");
    
    products.forEach(product => {
        const increaseButton = product.querySelector(".increase");
        const decreaseButton = product.querySelector(".decrease");
        const quantityElement = product.querySelector(".quantity");
        const productId = product.dataset.productId;
        const hiddenInput = document.getElementById(`quantity_${productId}`);
        
        increaseButton.addEventListener("click", function () {
            let quantity = parseInt(quantityElement.textContent);
            quantity++;
            quantityElement.textContent = quantity;
            hiddenInput.value = quantity;
        });

        decreaseButton.addEventListener("click", function () {
            let quantity = parseInt(quantityElement.textContent);
            if (quantity > 0) {
                quantity--;
                quantityElement.textContent = quantity;
                hiddenInput.value = quantity;
            }
        });
    });
});


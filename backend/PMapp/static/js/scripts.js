document.addEventListener("DOMContentLoaded", function() {
    loadProductsFromURL();  // Charge les produits après le chargement de la page
});

// Fonction pour charger les produits depuis l'URL
function loadProductsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get("categorie");

    if (!categorie) {
        console.error("Aucune catégorie spécifiée dans l'URL.");
        return;
    }

    console.log("Catégorie extraite de l'URL :", categorie);

    fetch(`/api/produits?categorie=${categorie}`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("products-container");
            if (!container) return;
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "Aucun produit trouvé pour cette catégorie.";
                return;
            }

            data.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.classList.add("product");
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Prix: ${product.price}€</p>
                   
                    
                    <!-- Quantité -->
                    <div class="quantity">
                        <button class="decrease" data-id="${product.id}">-</button>
                        <span class="quantity-text">1</span>
                        <button class="increase" data-id="${product.id}">+</button>
                    </div>
                    
                    <!-- Ajouter au panier -->
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Ajouter au panier</button>
                `;
                container.appendChild(productDiv);
            });

            attachQuantityEvents();  // Attache les événements pour ajuster la quantité
            attachAddToCartEvents(); // Attache les événements pour ajouter au panier
        })
        .catch(error => console.error("Erreur lors du chargement des produits :", error));
}

// Fonction pour attacher les événements aux boutons "+" et "-"
function attachQuantityEvents() {
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', (e) => {
            const quantitySpan = e.target.previousElementSibling;
            let currentQuantity = parseInt(quantitySpan.textContent);
            if (currentQuantity < 99) {  // Limiter la quantité à 99
                quantitySpan.textContent = currentQuantity + 1;
            }
        });
    });

    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', (e) => {
            const quantitySpan = e.target.nextElementSibling;
            let currentQuantity = parseInt(quantitySpan.textContent);
            if (currentQuantity > 1) {  // Ne pas descendre en dessous de 1
                quantitySpan.textContent = currentQuantity - 1;
            }
        });
    });
}

// Fonction pour attacher l'événement "Ajouter au panier"
function attachAddToCartEvents() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"));
            const productName = e.target.getAttribute("data-name");
            const productPrice = parseFloat(e.target.getAttribute("data-price"));
            const quantity = parseInt(e.target.previousElementSibling.querySelector('.quantity-text').textContent);
            
            addProductToCart(productId, productName, productPrice, quantity);
        });
    });
}

// Fonction pour ajouter un produit au panier
function addProductToCart(productId, productName, productPrice, quantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: quantity });
    } else {
        cart[productIndex].quantity += quantity;  // Incrémente la quantité si le produit est déjà dans le panier
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();  // Mise à jour du nombre d'articles
}

// Mise à jour du nombre d'articles dans le panier
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}



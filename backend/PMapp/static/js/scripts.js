// Fonction pour charger les produits en fonction de la catégorie dans l'URL
function loadProductsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categorie = urlParams.get("categorie");

    // Vérifie si la catégorie est spécifiée dans l'URL
    if (!categorie) {
        console.error("Aucune catégorie spécifiée dans l'URL.");
        return;
    }

    console.log("Catégorie extraite de l'URL :", categorie);

    fetch(`/api/produits?categorie=${categorie}`) // Appel de l'API Flask pour récupérer les produits
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
                    <p>Stock: ${product.stock}</p>
                    <button class="add-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Ajouter au panier</button>
                `;
                container.appendChild(productDiv);
            });

            // Attache les événements après le chargement des produits
            attachAddToCartEvents();
        })
        .catch(error => console.error("Erreur lors du chargement des produits :", error));
}

// Fonction pour attacher les événements "Ajouter au panier"
function attachAddToCartEvents() {
    if (document.querySelectorAll(".add-btn").length === 0) return; // Evite de réattacher les événements
    document.querySelectorAll(".add-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = parseInt(e.target.getAttribute("data-id"));
            const productName = e.target.getAttribute("data-name");
            const productPrice = parseFloat(e.target.getAttribute("data-price"));
            addProductToCart(productId, productName, productPrice);
        });
    });
}

// Ajout d'un produit au panier
function addProductToCart(productId, productName, productPrice) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    } else {
        cart[productIndex].quantity++;  // Incrémente la quantité si le produit est déjà dans le panier
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();  // Mise à jour du nombre d'articles
    displayCart();      // Affichage du contenu du panier
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

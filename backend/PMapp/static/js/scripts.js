// Fonction pour ajouter un produit
function addProduct(button) {
    const productNameInput = button.previousElementSibling;
    const productName = productNameInput.value.trim();
    if (!productName) {
        alert('Veuillez entrer un nom pour le produit.');
        return;
    }

    const productsList = button.parentElement.nextElementSibling;

    const productDiv = document.createElement('div');
    productDiv.classList.add('product');
    productDiv.textContent = productName;

    productsList.appendChild(productDiv);

    productNameInput.value = '';
}

// Fonction pour revenir à la page d'accueil
function goHome() {
    window.location.href = 'index.html'; // Redirige vers la page d'accueil
}

// Fonction de gestion des catégories
function handleCategorySelection() {
    const categoryButtons = document.querySelectorAll('.category-btn'); // Sélectionne les boutons de catégorie
    const productSections = document.querySelectorAll('.category-products'); // Sélectionne toutes les sections de produits

    // Masquer toutes les sections par défaut
    productSections.forEach(section => {
        section.classList.remove('show'); // Cache toutes les sections en enlevant la classe 'show'
    });

    // Ajouter des écouteurs d'événements sur chaque bouton de catégorie
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche la redirection du lien
            const categoryId = button.getAttribute('data-category-id'); // Récupère l'ID de la catégorie

            // Masquer toutes les sections
            productSections.forEach(section => {
                section.classList.remove('show'); // Cache toutes les sections
            });

            // Afficher la section correspondante à la catégorie cliquée
            const selectedSection = document.getElementById(categoryId);
            if (selectedSection) {
                selectedSection.classList.add('show'); // Affiche la section sélectionnée
            }
        });
    });

    // Afficher la première catégorie par défaut (si nécessaire)
    if (productSections.length > 0) {
        productSections[0].classList.add('show'); // Affiche la première section
    }
}

// Fonction pour rechercher un produit
function searchProduct() {
    const searchValue = document.getElementById('search-input').value.trim().toLowerCase();
    const allProducts = document.querySelectorAll('.category-products .product');

    allProducts.forEach(product => {
        const productName = product.textContent.toLowerCase();
        if (productName.includes(searchValue)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Initialisation du panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fonction pour ajouter un produit au panier
function addProductToCart(productName) {
    const productIndex = cart.findIndex(product => product.name === productName);

    if (productIndex === -1) {
        cart.push({ name: productName, quantity: 1 });
    } else {
        cart[productIndex].quantity++;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Fonction pour mettre à jour le nombre d'articles dans le panier
function updateCartCount() {
    const cartCount = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Fonction pour afficher le panier
function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');

    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.textContent = 'Votre panier est vide.';
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - Quantité : ${item.quantity}`;
        cartContainer.appendChild(li);
    });
}

// Événements au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    handleCategorySelection(); // Gestion des catégories

    // Mise à jour du panier au chargement
    updateCartCount();

    // Affichage du contenu du panier si une section dédiée existe
    displayCart();

    // Ajout de l'écouteur pour la recherche
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchProduct);
    }

    // Ajout des écouteurs d'événements pour les boutons "Ajouter au panier"
    const addToCartButtons = document.querySelectorAll('.add-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.closest('.product').querySelector('p').textContent;
            addProductToCart(productName);
        });
    });
});


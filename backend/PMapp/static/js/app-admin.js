// Fonction pour afficher les produits depuis le backend
const renderProducts = async () => {
    const productList = document.getElementById('product-list');
    const productContainer = document.getElementById('product-container');
    const loadMoreBtn = document.getElementById("load-more");

    if (!productList || !productContainer || !loadMoreBtn) {
        console.error("Erreur : Un élément de la page est introuvable.");
        return;
    }

    productList.innerHTML = ''; // Vide la liste avant de réajouter les produits
    productContainer.innerHTML = ''; // Vide aussi l'affichage des produits

    try {
        const response = await fetch('/api/produits'); // Récupère la liste des produits
        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
            productContainer.innerHTML = "<p>Aucun produit disponible.</p>";
            loadMoreBtn.style.display = "none";
            return;
        }

        products.forEach((product, index) => {
            const productItem = document.createElement('li');
            productItem.innerHTML = `
                ${product.name} - ${product.category} - ${product.price.toFixed(2)}€ 
                <button class="delete-product" data-id="${product.id}">Supprimer</button>
            `;
            productList.appendChild(productItem);

            const productDiv = document.createElement('div');
            productDiv.classList.add("product");
            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p>Prix : ${product.price.toFixed(2)}€</p>
                <p>Catégorie : ${product.category}</p>
            `;
            productDiv.style.display = index < 5 ? "block" : "none"; // Affiche les 5 premiers produits
            productContainer.appendChild(productDiv);
        });

        // Gérer le bouton "Voir plus"
        loadMoreBtn.style.display = products.length > 5 ? "block" : "none";
        setupLoadMore(products);

        // Ajout des événements pour les boutons de suppression
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.dataset.id, 10);
                await deleteProduct(productId);
            });
        });

    } catch (error) {
        console.error('Erreur de connexion au backend pour récupérer les produits:', error);
    }
};

// Fonction pour ajouter un produit via le formulaire
const addProduct = async (e) => {
    e.preventDefault();

    const nameField = document.getElementById('name');
    const priceField = document.getElementById('price');
    const categoryField = document.getElementById('category');

    if (!nameField || !priceField || !categoryField) {
        console.error("Erreur : Un ou plusieurs champs sont introuvables.");
        return;
    }

    const name = nameField.value.trim();
    const price = parseFloat(priceField.value);
    const category = categoryField.value.trim();

    if (!name || isNaN(price) || !category) {
        console.error("Erreur : Veuillez remplir correctement tous les champs.");
        return;
    }

    const newProduct = { name, price: parseFloat(price.toFixed(2)), category };

    try {
        const response = await fetch('/api/produits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: Impossible d'ajouter le produit.`);
        }

        console.log('Produit ajouté:', newProduct);
        await renderProducts();
        document.getElementById('addProductForm').reset();
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
    }
};

// Fonction pour supprimer un produit
const deleteProduct = async (id) => {
    try {
        const response = await fetch(`/api/produits/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: Impossible de supprimer le produit.`);
        }

        console.log(`Produit supprimé avec l'ID: ${id}`);
        await renderProducts();
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
    }
};

// Gérer le système "Voir plus"
const setupLoadMore = (products) => {
    const loadMoreBtn = document.getElementById("load-more");

    if (!loadMoreBtn) {
        console.error("Erreur : Bouton 'Voir plus' introuvable.");
        return;
    }

    let visibleCount = 5;

    loadMoreBtn.addEventListener("click", function () {
        const productDivs = document.querySelectorAll("#product-container .product");

        for (let i = visibleCount; i < visibleCount + 5 && i < products.length; i++) {
            if (productDivs[i]) {
                productDivs[i].style.display = "block";
            }
        }

        visibleCount += 5;

        if (visibleCount >= products.length) {
            loadMoreBtn.style.display = "none";
        }
    });
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await renderProducts();

    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    } else {
        console.error("Erreur : Formulaire d'ajout introuvable.");
    }
});

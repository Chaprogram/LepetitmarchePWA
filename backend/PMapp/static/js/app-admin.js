// Fonction pour afficher les produits depuis le backend
const renderProducts = async () => {
    const productList = document.getElementById('product-list');
    const productContainer = document.getElementById('product-container');
    const loadMoreBtn = document.getElementById("load-more");
    
    productList.innerHTML = ''; // Vide la liste avant de réajouter les produits
    productContainer.innerHTML = ''; // Vide aussi l'affichage des produits

    try {
        const response = await fetch('/api/produits'); // Récupère la liste des produits depuis le backend
        const products = await response.json();

        // Vérifie si des produits existent
        if (products.length === 0) {
            productContainer.innerHTML = "<p>Aucun produit disponible.</p>";
            return;
        }

        // Ajout des produits dans la liste et dans le conteneur
        products.forEach((product, index) => {
            const productItem = document.createElement('li');
            productItem.innerHTML = `
                ${product.name} - ${product.category} - ${product.price}€ 
                <button class="delete-product" data-id="${product.id}">Supprimer</button>
            `;
            productList.appendChild(productItem);

            const productDiv = document.createElement('div');
            productDiv.classList.add("product");
            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p>Prix : ${product.price}€</p>
                <p>Catégorie : ${product.category}</p>
            `;
            productDiv.style.display = "none"; // Tous les produits sont cachés au départ
            productContainer.appendChild(productDiv);
        });

        // Gérer le bouton "Voir plus"
        if (products.length > 5) {
            loadMoreBtn.style.display = "block";
        } else {
            loadMoreBtn.style.display = "none";
        }

        // Initialiser la visibilité des premiers produits
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
    e.preventDefault(); // Empêche l'envoi du formulaire

    // Récupère les valeurs du formulaire
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

    // Crée un nouvel objet produit
    const newProduct = { name, price, category };

    // Envoie le produit au backend via une requête POST
    try {
        const response = await fetch('/api/produits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });

        if (response.ok) {
            console.log('Produit ajouté:', newProduct);
            await renderProducts(); // Réactualise la liste des produits
            document.getElementById('addProductForm').reset(); // Réinitialise le formulaire
        } else {
            console.error('Erreur lors de l\'ajout du produit');
        }
    } catch (error) {
        console.error('Erreur de connexion au backend:', error);
    }
};

// Fonction pour supprimer un produit
const deleteProduct = async (id) => {
    try {
        const response = await fetch(`/api/produits/${id}`, { method: 'DELETE' });

        if (response.ok) {
            console.log('Produit supprimé avec l\'ID:', id);
            await renderProducts(); // Réactualise la liste des produits
        } else {
            console.error('Erreur lors de la suppression du produit');
        }
    } catch (error) {
        console.error('Erreur de connexion au backend pour supprimer le produit:', error);
    }
};

// Gérer le système "Voir plus"
const setupLoadMore = (products) => {
    const loadMoreBtn = document.getElementById("load-more");

    if (!loadMoreBtn) {
        console.error("Erreur : Bouton 'Voir plus' introuvable.");
        return;
    }

    let visibleCount = 5; // Commence avec 5 produits visibles

    loadMoreBtn.addEventListener("click", function () {
        const productDivs = document.querySelectorAll("#product-container .product");
        
        for (let i = visibleCount; i < visibleCount + 5 && i < products.length; i++) {
            productDivs[i].style.display = "block";  // Affiche les produits suivants
        }

        visibleCount += 5;

        // Cacher le bouton si tous les produits sont affichés
        if (visibleCount >= products.length) {
            loadMoreBtn.style.display = "none";
        }
    });
};

// Fonction d'initialisation qui appelle toutes les fonctions au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await renderProducts(); // Afficher les produits
    // Ajouter un produit au soumettre du formulaire
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    } else {
        console.error("Erreur : Formulaire d'ajout introuvable.");
    }
});

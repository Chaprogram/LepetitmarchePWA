const renderProducts = async () => {
    const productContainer = document.getElementById('product-container');
    const loadMoreBtn = document.getElementById("load-more");

    if (!productContainer || !loadMoreBtn) {
        console.error("Erreur : Un élément de la page est introuvable.");
        return;
    }

    productContainer.innerHTML = ''; // Vide l'affichage des produits

    try {
        const response = await fetch('/api/produits'); // Récupère la liste des produits
        const products = await response.json();

        if (!Array.isArray(products) || products.length === 0) {
            productContainer.innerHTML = "<p>Aucun produit disponible.</p>";
            loadMoreBtn.style.display = "none";
            return;
        }

        let visibleCount = 5; // Nombre de produits visibles au départ

        products.forEach((product, index) => {
            const productDiv = document.createElement('div');
            productDiv.classList.add("product");
            productDiv.innerHTML = `
                <h3>${product.name}</h3>
                <p>Prix : ${product.price.toFixed(2)}€</p>
                <p>Catégorie : ${product.category}</p>
                <button class="delete-product" data-id="${product.id}">Supprimer</button>
            `;
            productDiv.style.display = index < visibleCount ? "block" : "none"; // Afficher les 5 premiers produits
            productContainer.appendChild(productDiv);
        });

        // Gérer le bouton "Voir plus"
        loadMoreBtn.style.display = products.length > visibleCount ? "block" : "none";

        loadMoreBtn.onclick = () => {
            const productDivs = document.querySelectorAll("#product-container .product");
            for (let i = visibleCount; i < visibleCount + 5 && i < products.length; i++) {
                productDivs[i].style.display = "block";
            }
            visibleCount += 5;

            if (visibleCount >= products.length) {
                loadMoreBtn.style.display = "none";
            }
        };

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

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await renderProducts();
});

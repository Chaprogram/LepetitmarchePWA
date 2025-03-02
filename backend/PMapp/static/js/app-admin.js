// Fonction pour afficher les produits depuis le backend
const renderProducts = async () => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Vide la liste avant de réajouter les produits

    try {
        const response = await fetch('/api/produits'); // Récupère la liste des produits depuis le backend
        const products = await response.json();

        // Parcours des produits pour les ajouter à la liste
        products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.innerHTML = `
                ${product.name} - ${product.category} - ${product.price}€ 
                <button class="delete-product" data-id="${product.id}">Supprimer</button>
            `;
            productList.appendChild(productItem);
        });

        // Ajout des événements pour chaque bouton de suppression
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id, 10);
                deleteProduct(productId);
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
    const productNameField = document.getElementById('name');
if (productNameField) {
    const productName = productNameField.value;
} else {
    console.error('Le champ de produit n\'existe pas.');
}

    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;
    

    // Crée un nouvel objet produit
    const newProduct = {
        name: name,
        price: price,
        category: category,
       
    };

    // Envoie le produit au backend via une requête POST
    try {
        const response = await fetch('/api/produits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        });

        if (response.ok) {
            console.log('Produit ajouté:', newProduct);
            renderProducts(); // Réactualise la liste des produits
        } else {
            console.error('Erreur lors de l\'ajout du produit');
        }
    } catch (error) {
        console.error('Erreur de connexion au backend:', error);
    }

    // Réinitialise le formulaire
    document.getElementById('addProductForm').reset();
};

// Fonction pour supprimer un produit
const deleteProduct = async (id) => {
    try {
        const response = await fetch(`/api/produits/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Produit supprimé avec l\'ID:', id);
            renderProducts(); // Réactualise la liste des produits
        } else {
            console.error('Erreur lors de la suppression du produit');
        }
    } catch (error) {
        console.error('Erreur de connexion au backend pour supprimer le produit:', error);
    }
};

// Fonction d'initialisation qui appelle toutes les fonctions au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(); // Afficher les produits

    // Ajouter un produit au soumettre du formulaire
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', addProduct);
});


document.addEventListener("DOMContentLoaded", function () {
    const products = document.querySelectorAll("#product-container .product");
    const loadMoreBtn = document.getElementById("load-more");
    let visibleCount = 5; // Nombre de produits visibles au départ

    // Cacher les produits au-delà des 5 premiers
    products.forEach((product, index) => {
        if (index >= visibleCount) {
            product.style.display = "none";
        }
    });

    // Afficher le bouton si plus de 5 produits
    if (products.length > visibleCount) {
        loadMoreBtn.style.display = "block";
    }

    // Gérer le clic sur "Voir plus"
    loadMoreBtn.addEventListener("click", function () {
        let newVisibleCount = visibleCount + 5;
        products.forEach((product, index) => {
            if (index < newVisibleCount) {
                product.style.display = "block";
            }
        });

        visibleCount = newVisibleCount;

        // Cacher le bouton si tous les produits sont affichés
        if (visibleCount >= products.length) {
            loadMoreBtn.style.display = "none";
        }
    });
});

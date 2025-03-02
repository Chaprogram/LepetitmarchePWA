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

// Fonction pour afficher les produits depuis le backend
const renderProducts = async () => {
    const productList = document.getElementById('product-list');
    const productContainer = document.getElementById('product-container');

    if (!productList || !productContainer) {
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
            return;
        }

        // Afficher les produits
        products.forEach((product) => {
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
            productDiv.style.display = "block"; // Affiche tous les produits
            productContainer.appendChild(productDiv);
        });

    } catch (error) {
        console.error('Erreur de connexion au backend pour récupérer les produits:', error);
    }
};

// Fonction pour ajouter un produit
function addProduct(name, price, category) {
    fetch('/api/ajouter_produit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            price: price,
            category: category,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Gérer la réponse du serveur après ajout du produit
        if (data.success) {
            alert("Produit ajouté avec succès!");
            // Vous pouvez aussi réactualiser la liste des produits ici si nécessaire
            renderProducts();
        } else {
            alert("Erreur lors de l'ajout du produit.");
        }
    })
    .catch(error => {
        console.error("Erreur lors de l'ajout du produit :", error);
    });
}

// Ajout d'un événement au formulaire d'ajout de produit
document.getElementById('addProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const category = document.getElementById('category').value;

    if (name && price && category) {
        addProduct(name, price, category); // Appeler la fonction addProduct pour ajouter le produit
    } else {
        alert("Veuillez remplir tous les champs.");
    }
});

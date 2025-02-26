// Fonction pour afficher les produits (liste dynamique)
const renderProducts = () => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Vider la liste avant de réajouter les produits

    // Simule les produits (en attendant que ce soit dynamique depuis le backend)
    const products = [
        { id: 1, nom: 'Chocolat au Lait', prix: 2.50, categorie: 'chocolats', stock: 100 },
        { id: 2, nom: 'Chips Nature', prix: 1.20, categorie: 'chips', stock: 50 }
    ];

    // Parcours des produits pour les ajouter à la liste
    products.forEach(product => {
        const productItem = document.createElement('li');
        productItem.innerHTML = `
            ${product.nom} - ${product.categorie} - ${product.prix}€ 
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
};

// Fonction pour ajouter un produit
const addProduct = (e) => {
    e.preventDefault(); // Empêche l'envoi du formulaire

    // Récupère les valeurs du formulaire
    const name = document.getElementById('nom').value;
    const price = parseFloat(document.getElementById('prix').value);
    const category = document.getElementById('categorie').value;
    const stock = parseInt(document.getElementById('stock').value, 10);

    // Crée un nouveau produit
    const newProduct = {
        id: Date.now(),  // Utilisation de Date.now() pour générer un ID unique
        nom: name,
        prix: price,
        categorie: category,
        stock: stock
    };

    // Ajoute le produit (pour l'instant dans un tableau simulé, à remplacer par une requête backend)
    console.log('Produit ajouté:', newProduct);

    // Réinitialise le formulaire
    document.getElementById('addProductForm').reset();

    // Actualiser l'affichage des produits
    renderProducts();
};

// Fonction pour supprimer un produit
const deleteProduct = (id) => {
    // Ici on supprimerait le produit dans la base de données ou le tableau
    console.log('Suppression du produit avec ID:', id);
    renderProducts(); // Actualiser la liste après suppression
};

// Fonction pour afficher les notifications (simulées ici)
const renderNotifications = () => {
    const notificationsList = document.getElementById('notificationsList');
    notificationsList.innerHTML = ''; // Vider la liste des notifications

    // Exemple de notifications simulées
    const notifications = [
        { id: 1, message: "Commande #1 : Chocolat au Lait ajouté au panier." },
        { id: 2, message: "Commande #2 : Chips Nature ajouté au panier." }
    ];

    // Ajoute les notifications à la liste
    notifications.forEach(notification => {
        const notificationItem = document.createElement('li');
        notificationItem.textContent = notification.message;
        notificationsList.appendChild(notificationItem);
    });
};

// Fonction pour afficher les réservations (simulées ici)
const renderReservations = () => {
    const reservationsTable = document.querySelector('#reservations tbody');
    reservationsTable.innerHTML = ''; // Vider la table des réservations

    // Exemple de réservations simulées
    const reservations = [
        { client: 'Jean Dupont', produit: 'Chocolat au Lait', quantite: 2, date: '2025-02-27' },
        { client: 'Marie Martin', produit: 'Chips Nature', quantite: 3, date: '2025-02-28' }
    ];

    // Ajoute les réservations à la table
    reservations.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.client}</td>
            <td>${reservation.produit}</td>
            <td>${reservation.quantite}</td>
            <td>${reservation.date}</td>
        `;
        reservationsTable.appendChild(row);
    });
};

// Fonction d'initialisation qui appelle toutes les fonctions au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(); // Afficher les produits
    renderNotifications(); // Afficher les notifications
    renderReservations(); // Afficher les réservations

    // Ajouter un produit au soumettre du formulaire
    const addProductForm = document.getElementById('addProductForm');
    addProductForm.addEventListener('submit', addProduct);
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("addProductForm");
    const productList = document.getElementById("orders-list");

    // Charger les produits
    function loadProducts() {
        fetch("/produits")
            .then(response => response.json())
            .then(data => {
                productList.innerHTML = ""; // Nettoyer la liste
                data.forEach(product => {
                    const productItem = document.createElement("div");
                    productItem.innerHTML = `
                        <p>${product.nom} - ${product.prix}€ (${product.categorie}) - Stock: ${product.stock}</p>
                        <button class="delete-btn" data-id="${product.id}">Supprimer</button>
                    `;
                    productList.appendChild(productItem);
                });

                // Ajouter les events pour supprimer
                document.querySelectorAll(".delete-btn").forEach(btn => {
                    btn.addEventListener("click", function () {
                        const productId = this.getAttribute("data-id");
                        deleteProduct(productId);
                    });
                });
            })
            .catch(error => console.error("Erreur lors du chargement des produits:", error));
    }

    // Ajouter un produit
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const produitData = {
            name: document.getElementById("nom").value,   // 'name' au lieu de 'nom'
            price: parseFloat(document.getElementById("prix").value), 
            category: document.getElementById("categorie").value,
            stock: parseInt(document.getElementById("stock").value)
        };
        
        fetch("/ajouter_produit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(produitData)
        })
        .then(response => response.json())
        .then(data => {
            alert("Produit ajouté !");
            loadProducts(); // Rafraîchir la liste
            form.reset();
        })
        .catch(error => console.error("Erreur lors de l'ajout du produit:", error));
    });

    // Supprimer un produit
    function deleteProduct(id) {
        fetch(`/supprimer_produit/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadProducts(); // Rafraîchir la liste
            })
            .catch(error => console.error("Erreur lors de la suppression:", error));
    }

    // Charger les produits au chargement de la page
    loadProducts();
});

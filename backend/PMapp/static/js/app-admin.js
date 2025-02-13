document.addEventListener("DOMContentLoaded", function () {
  // Sélection des éléments du DOM
  const form = document.getElementById("addProductForm");
  
  const notificationsList = document.getElementById("notificationsList");
  const reservationsTable = document.querySelector("#reservations tbody");

  
  

  // ✅ 1. Envoi du formulaire pour ajouter un produit
  form.addEventListener("submit", function (event) {
      event.preventDefault(); // Empêche le rechargement de la page

      // Récupération des valeurs du formulaire
      const nom = document.getElementById("nom").value;
      const prix = document.getElementById("prix").value;
      const categorie = document.getElementById("categorie").value;
      const stock = document.getElementById("stock").value;
      const description = document.getElementById("description").value;

      // Création de l'objet à envoyer
      const produit = {
          nom: nom,
          prix: prix,
          categorie: categorie,
          stock: stock,
          description: description
      };

      // Envoi des données vers le serveur Flask
      fetch("/add_product", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(produit)
      })
      .then(response => response.json())
      .then(data => {
          alert(data.message); // Affiche une notification
          form.reset(); // Réinitialise le formulaire
      })
      .catch(error => console.error("Erreur:", error));
  });

  // ✅ 2. Récupération et affichage des notifications des commandes
  function loadNotifications() {
      fetch("/notifications")
      .then(response => response.json())
      .then(data => {
          notificationsList.innerHTML = ""; // Vide la liste avant de la remplir
          if (data.length === 0) {
              notificationsList.innerHTML = "<li>Aucune notification pour le moment.</li>";
          } else {
              data.forEach(notification => {
                  const li = document.createElement("li");
                  li.textContent = `Commande de ${notification.client} : ${notification.produit} x ${notification.quantite}`;
                  notificationsList.appendChild(li);
              });
          }
      })
      .catch(error => console.error("Erreur lors du chargement des notifications:", error));
  }

  // ✅ 3. Récupération et affichage des réservations
  function loadReservations() {
      fetch("/reservations")
      .then(response => response.json())
      .then(data => {
          reservationsTable.innerHTML = ""; // Vide le tableau avant de le remplir
          if (data.length === 0) {
              reservationsTable.innerHTML = `
                  <tr>
                      <td>Aucun enregistrement</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                  </tr>
              `;
          } else {
              data.forEach(reservation => {
                  const tr = document.createElement("tr");
                  tr.innerHTML = `
                      <td>${reservation.client}</td>
                      <td>${reservation.produit}</td>
                      <td>${reservation.quantite}</td>
                      <td>${reservation.date}</td>
                  `;
                  reservationsTable.appendChild(tr);
              });
          }
      })
      .catch(error => console.error("Erreur lors du chargement des réservations:", error));
  }

  // Charger les données au démarrage
  loadNotifications();
  loadReservations();

  // Rafraîchir les données toutes les 10 secondes
  setInterval(loadNotifications, 10000);
  setInterval(loadReservations, 10000);
});


// Vérifie si 'socket' est déjà défini pour éviter la double déclaration
if (typeof socket === "undefined") {
  var socket = io.connect('http://127.0.0.1:5000');

  socket.on('connect', function() {
      console.log("✅ Connecté au serveur SocketIO !");
  });

  socket.on('order_notification', function(data) {
      console.log("🔔 Notification reçue :", data.message);
      alert(data.message);  // Affichage d'une alerte pour tester
  });
}

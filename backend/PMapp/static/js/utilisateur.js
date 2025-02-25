document.addEventListener('DOMContentLoaded', function() {
    const jwtToken = getJwtToken(); // Assurez-vous que vous récupérez le token JWT ici

    // Vérifier si le token existe avant d'essayer de charger les données
    if (jwtToken) {
        fetch('/utilisateur', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtToken // Ajout du token JWT dans l'en-tête
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json(); // Récupérer les données de l'utilisateur
            } else {
                window.location.href = '/login'; // Rediriger vers la page de login si non autorisé
            }
        })
        .then(user => {
            // Affichage des informations utilisateur sur la page
            document.getElementById('nom').innerText = user.nom;
            document.getElementById('prenom').innerText = user.prenom;
            document.getElementById('email').innerText = user.email;
            document.getElementById('adresse').innerText = user.adresse;
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données utilisateur:', error);
        });
    } else {
        window.location.href = '/login'; // Si pas de token, rediriger vers login
    }
});



// Récupérer le token JWT depuis le localStorage ou une autre source
function getJwtToken() {
    return localStorage.getItem('jwt_token');  // Assurez-vous que le token est stocké dans le localStorage lors de la connexion
}

// Fonction de logout pour supprimer le token JWT et rediriger
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('jwt_token');  // Suppression du token JWT
    window.location.href = '/login';  // Redirection vers la page de connexion
});


// Afficher / masquer le formulaire de modification
document.getElementById('edit-info-btn').addEventListener('click', function() {
    document.getElementById('edit-form').classList.toggle('hidden');
});

// Annuler les modifications
document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('edit-form').classList.add('hidden');
});

// Soumettre les modifications du profil
document.getElementById('edit-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche le comportement par défaut du formulaire

    const formData = new FormData(this);  // Récupère les données du formulaire
    const data = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        email: formData.get('email'),
        adresse: formData.get('adresse')
    };

    // Envoi des données au backend via une requête POST avec le JWT dans l'en-tête
    fetch('/modifier_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getJwtToken()  // Ajout du token JWT dans l'en-tête Authorization
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);  // Affiche un message de succès
            window.location.reload();  // Recharger la page pour afficher les informations mises à jour
        } else {
            alert('Erreur lors de la modification');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification');
    });
});

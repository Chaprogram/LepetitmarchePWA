document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                window.location.href = '/login'; // Rediriger vers la page de login si l'utilisateur n'est pas connecté
            } else {
                // Affichage des informations utilisateur
                fetch('/utilisateur', {
                    method: 'GET',
                })
                .then(response => response.json()) // Récupérer les données de l'utilisateur
                .then(user => {
                    document.getElementById('username').innerText = user.username;
                    document.getElementById('email').innerText = user.email;
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des données utilisateur:', error);
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de la session:', error);
            window.location.href = '/login'; // Rediriger vers la page de login si un problème survient
        });
});

// Fonction de logout pour supprimer la session et rediriger
document.getElementById('logout-btn').addEventListener('click', () => {
    fetch('/logout', {
        method: 'GET',
    })
    .then(() => {
        window.location.href = '/login';  // Redirection vers la page de connexion après déconnexion
    })
    .catch(error => {
        console.error('Erreur lors de la déconnexion:', error);
    });
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

    // Envoi des données au backend via une requête POST pour modifier les informations utilisateur
    fetch('/modifier_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

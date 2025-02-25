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


    

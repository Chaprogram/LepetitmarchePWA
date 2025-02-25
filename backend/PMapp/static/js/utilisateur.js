// Sélection des éléments du DOM
const editInfoBtn = document.getElementById('edit-info-btn');
const editForm = document.getElementById('edit-form');
const cancelBtn = document.getElementById('cancel-btn');
const logoutBtn = document.getElementById('logout-btn');
const changePhotoBtn = document.getElementById('change-photo-btn');
const uploadPhotoInput = document.getElementById('upload-photo');
const profilePic = document.getElementById('profile-pic');

// ✅ Afficher le formulaire de modification
editInfoBtn.addEventListener('click', () => {
    editForm.classList.remove('hidden');
    editInfoBtn.style.display = 'none';
});

// ❌ Annuler la modification
cancelBtn.addEventListener('click', () => {
    editForm.classList.add('hidden');
    editInfoBtn.style.display = 'inline-block';
});

// 📤 Upload de la photo de profil
changePhotoBtn.addEventListener('click', () => {
    uploadPhotoInput.click();
});

uploadPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePic.src = event.target.result; // Affiche l'image sélectionnée
            // Ici, tu peux envoyer l'image au backend si nécessaire
        };
        reader.readAsDataURL(file);
    }
});

// 📝 Soumettre le formulaire de modification
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(editForm);

    try {
        const response = await fetch('/update-profile', {
            method: 'POST',
            body: JSON.stringify({
                nom: formData.get('nom'),
                prenom: formData.get('prenom'),
                email: formData.get('email'),
                adresse: formData.get('adresse')
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT pour l'authentification
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Met à jour les informations affichées
            document.getElementById('nom').textContent = data.nom;
            document.getElementById('prenom').textContent = data.prenom;
            document.getElementById('email').textContent = data.email;
            document.getElementById('adresse').textContent = data.adresse;

            editForm.classList.add('hidden');
            editInfoBtn.style.display = 'inline-block';
        } else {
            alert('Erreur lors de la modification.');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});

// 🚪 Déconnexion
logoutBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            localStorage.removeItem('token'); // Supprime le token JWT
            window.location.href = '/'; // Redirige vers la page d'accueil
        } else {
            alert('Erreur lors de la déconnexion.');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});


// 🛒 Charger la liste des commandes
async function loadOrders() {
    try {
        const response = await fetch('/get-orders', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = ''; // Vide la liste actuelle

            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.date}</td>
                    <td>${order.commande}</td>
                    <td>${order.montant}€</td>
                    <td>${order.status}</td>
                `;
                ordersList.appendChild(row);
            });
        } else {
            console.error('Erreur de chargement des commandes');
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// 🔒 Vérification de la connexion de l'utilisateur
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login'; // Redirige vers la page de connexion si non connecté
    } else {
        await loadOrders();
    }
}

// Lance la vérification au chargement de la page
window.addEventListener('DOMContentLoaded', checkAuth);

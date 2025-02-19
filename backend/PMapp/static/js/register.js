document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêche l'envoi immédiat

        // Récupération des champs
        const username = document.querySelector("input[name='username']").value.trim();
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password']").value;
        const confirmPassword = document.querySelector("input[name='confirm_password']").value;

        let errors = [];

        // Vérification des champs
        if (username === "") {
            errors.push("Le nom d'utilisateur est requis.");
        }

        if (email === "" || !validateEmail(email)) {
            errors.push("Veuillez entrer un email valide.");
        }

        if (password.length < 6) {
            errors.push("Le mot de passe doit contenir au moins 6 caractères.");
        }

        if (password !== confirmPassword) {
            errors.push("Les mots de passe ne correspondent pas.");
        }

        // Affichage des erreurs ou soumission du formulaire
        const errorContainer = document.getElementById("form-errors");
        errorContainer.innerHTML = "";

        if (errors.length > 0) {
            errors.forEach(error => {
                const p = document.createElement("p");
                p.textContent = error;
                p.style.color = "red";
                errorContainer.appendChild(p);
            });
        } else {
            form.submit(); // Envoie le formulaire si tout est bon
        }
    });

    // Fonction de validation d'email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

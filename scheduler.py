from apscheduler.schedulers.background import BackgroundScheduler
from . import send_admin_report  # Assurez-vous que la fonction pour envoyer l'email est correctement importée

def schedule_report(app):
    # Créer un planificateur en arrière-plan
    scheduler = BackgroundScheduler()

    # Ajouter une tâche cron pour envoyer l'email chaque jour à 15h00
    scheduler.add_job(func=send_admin_report, trigger="cron", hour=15, minute=0)  # Configure l'heure et la minute
    
    # Démarrer le planificateur
    scheduler.start()

    # Veiller à ne pas arrêter le planificateur lors de la fermeture de l'application
    try:
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
import pytz
from datetime import datetime
from .utils import send_admin_report  # Assurez-vous que la fonction pour envoyer l'email est correctement importée

def schedule_report():
    scheduler = BackgroundScheduler(timezone=pytz.timezone('Europe/Paris'))  # Définir le fuseau horaire sur Paris
    
    # Planifie le job à 15:00 heure locale de Paris
    scheduler.add_job(func=send_admin_report, trigger="cron", hour=15, minute=0)
    scheduler.start()

    # Ajoute un gestionnaire pour vérifier l'exécution des jobs
    def job_listener(event):
        if event.exception:
            print(f"Erreur lors de l'exécution du job: {event.job_id}")
        else:
            print(f"Job exécuté: {event.job_id}")

    scheduler.add_listener(job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)


    # Veiller à ne pas arrêter le planificateur lors de la fermeture de l'application
    try:
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


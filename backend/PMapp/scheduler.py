from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR
import pytz
from .utils import send_admin_report  # Assurez-vous que la fonction pour envoyer l'email est correctement importée
import threading

def schedule_report():
    # Définir le fuseau horaire sur Paris
    scheduler = BackgroundScheduler(timezone=pytz.timezone('Europe/Paris'))  
    
    # Planifier le job pour l'exécution quotidienne à 15:00, heure locale de Paris
    scheduler.add_job(func=send_admin_report, trigger="cron", hour=15, minute=0)
    
    # Ajouter un listener pour les événements d'exécution des jobs
    def job_listener(event):
        if event.exception:
            print(f"Erreur lors de l'exécution du job: {event.job_id}")
        else:
            print(f"Job exécuté: {event.job_id}")

    scheduler.add_listener(job_listener, EVENT_JOB_EXECUTED | EVENT_JOB_ERROR)

    # Lancer le scheduler dans un thread séparé pour qu'il n'empêche pas Flask de tourner
    def run_scheduler():
        scheduler.start()

    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.start()

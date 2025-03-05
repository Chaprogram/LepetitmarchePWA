from apscheduler.schedulers.background import BackgroundScheduler
from . import send_admin_report  # Assurez-vous que la fonction pour envoyer l'email est correctement importée

def schedule_report():
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=send_admin_report, trigger="cron", hour=15, minute=0)  # Configure l'heure et la minute
    scheduler.start()

# Assurez-vous que vous appelez schedule_report() dans le bon endroit de votre application pour initialiser le scheduler

from dotenv import load_dotenv
from src import create_app
from src.config import Config, DevelopmentConfig, ProductionConfig
import os

if __name__ == "__main__":
    # Choose configuration based on environment or other criteria
   load_dotenv()
   config = DevelopmentConfig if os.getenv("FLASK_ENV") == "development" else ProductionConfig

   app = create_app(config)
   app.run(
        port= config.PORT,
        host= config.HOST,
        debug= config.DEBUG
   )
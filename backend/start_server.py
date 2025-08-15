#!/usr/bin/env python3
"""
ZEKO Backend Startup Script
Automatically sets up and runs the FastAPI backend server
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        sys.exit(1)
    logger.info(f"Python version: {sys.version}")

def check_environment_file():
    """Check if .env file exists"""
    env_file = Path(".env")
    if not env_file.exists():
        logger.warning(".env file not found. Creating from template...")
        example_file = Path(".env.example")
        if example_file.exists():
            example_file.rename(env_file)
            logger.info("Created .env file from .env.example")
        else:
            logger.error("No .env.example file found. Please create .env manually")
            return False
    return True

def check_firebase_credentials():
    """Check if Firebase service account file exists"""
    cred_file = Path("zeko-70d2a-firebase-adminsdk-fbsvc-8aa211ce34.json")
    if not cred_file.exists():
        logger.warning("Firebase service account file not found")
        logger.info("Please ensure you have the Firebase service account JSON file")
        logger.info("You can continue without it, but Firebase features won't work")
    else:
        logger.info("Firebase credentials found")

def install_dependencies():
    """Install Python dependencies"""
    logger.info("Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        logger.info("Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = ["tmp", "logs", "models"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    logger.info("Created necessary directories")

def run_server():
    """Run the FastAPI server"""
    logger.info("Starting ZEKO Backend API server...")
    logger.info("Server will be available at:")
    logger.info("  - API Documentation: http://localhost:8000/api/docs")
    logger.info("  - Alternative Docs: http://localhost:8000/api/redoc")
    logger.info("  - Health Check: http://localhost:8000/api/health")
    logger.info("\nPress Ctrl+C to stop the server")
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except ImportError:
        logger.error("uvicorn not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn[standard]"], check=True)
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("\nServer stopped by user")
    except Exception as e:
        logger.error(f"Failed to start server: {e}")

def main():
    """Main startup function"""
    logger.info("🚀 ZEKO Backend Startup Script")
    logger.info("=" * 50)
    
    # Change to backend directory if not already there
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Run startup checks
    check_python_version()
    
    if not check_environment_file():
        sys.exit(1)
    
    check_firebase_credentials()
    create_directories()
    
    # Ask user if they want to install dependencies
    install_deps = input("\nInstall/update dependencies? (y/n): ").lower().strip()
    if install_deps in ['y', 'yes', '']:
        if not install_dependencies():
            sys.exit(1)
    
    # Start the server
    run_server()

if __name__ == "__main__":
    main()

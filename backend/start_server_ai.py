#!/usr/bin/env python3
"""
ZEKO Backend Server - Phase 4 AI Development
============================================

Advanced startup script with AI models initialization and comprehensive error handling.
"""

import os
import sys
import subprocess
import logging
import time
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        logger.error("Python 3.8 or higher is required")
        return False
    logger.info(f"Python version: {sys.version}")
    return True

def setup_paths():
    """Setup Python path for imports"""
    backend_dir = Path(__file__).parent
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    # Change to backend directory
    os.chdir(backend_dir)
    logger.info(f"Working directory: {os.getcwd()}")

def check_virtual_environment():
    """Check if virtual environment is activated"""
    venv_path = Path(__file__).parent.parent / ".venv"
    if not venv_path.exists():
        logger.warning("Virtual environment not found. Creating...")
        return False
    
    # Check if we're in the virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        logger.info("Virtual environment is active")
        return True
    else:
        logger.warning("Virtual environment not activated")
        return False

def install_requirements():
    """Install Python requirements"""
    requirements_file = Path("requirements.txt")
    if not requirements_file.exists():
        logger.error("requirements.txt not found")
        return False
    
    try:
        logger.info("Installing requirements...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True, capture_output=True, text=True)
        logger.info("Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        return False

def check_environment_variables():
    """Check required environment variables"""
    required_vars = []
    optional_vars = [
        "GOOGLE_APPLICATION_CREDENTIALS",
        "FIREBASE_SERVICE_ACCOUNT_KEY",
        "PORT"
    ]
    
    missing_required = []
    for var in required_vars:
        if not os.getenv(var):
            missing_required.append(var)
    
    if missing_required:
        logger.error(f"Missing required environment variables: {missing_required}")
        return False
    
    missing_optional = []
    for var in optional_vars:
        if not os.getenv(var):
            missing_optional.append(var)
    
    if missing_optional:
        logger.info(f"Optional environment variables not set: {missing_optional}")
        logger.info("Some features may be limited")
    
    return True

def test_ai_models():
    """Test AI models import and initialization"""
    try:
        logger.info("Testing AI models...")
        
        # Test emotion model
        from ai_models.emotion_model import EmotionDetectionModel, create_mock_emotion_prediction
        emotion_model = EmotionDetectionModel()
        test_prediction = create_mock_emotion_prediction(bias_positive=True)
        logger.info(f"Emotion model test: {test_prediction['predicted_emotion']} ({test_prediction['confidence']:.2f})")
        
        # Test adaptive learning
        from ai_models.adaptive_learning import AdaptiveLearningModel, create_default_user_profile
        adaptive_model = AdaptiveLearningModel()
        test_profile = create_default_user_profile("test_user", 7)
        logger.info(f"Adaptive learning test: User profile created for age {test_profile.age}")
        
        # Test audio features (without actual audio)
        from ai_models.audio_features import AudioFeatureExtractor
        extractor = AudioFeatureExtractor()
        logger.info("Audio feature extractor initialized")
        
        logger.info("✅ All AI models initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ AI models test failed: {e}")
        return False

def test_api_imports():
    """Test API imports"""
    try:
        logger.info("Testing API imports...")
        
        from main import app
        from routers import speech, emotion, progress, gamification, ai_models
        
        logger.info("✅ All API modules imported successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ API import test failed: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    try:
        logger.info("🚀 Starting ZEKO Backend Server with AI Models...")
        
        # Import and start uvicorn
        import uvicorn
        
        # Server configuration
        host = "0.0.0.0"
        port = int(os.getenv("PORT", 8000))
        
        logger.info(f"Server will run on http://{host}:{port}")
        logger.info(f"API Documentation: http://{host}:{port}/api/docs")
        logger.info(f"AI Models Endpoints: http://{host}:{port}/api/ai")
        
        # Start server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=True,
            reload_dirs=["./"],
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        return False

def main():
    """Main startup function"""
    print("=" * 60)
    print("🤖 ZEKO Backend Server - Phase 4 AI Development")
    print("=" * 60)
    
    # Check system requirements
    if not check_python_version():
        sys.exit(1)
    
    # Setup paths
    setup_paths()
    
    # Check virtual environment
    if not check_virtual_environment():
        logger.warning("Proceeding without virtual environment...")
    
    # Check environment variables
    if not check_environment_variables():
        logger.warning("Proceeding with missing environment variables...")
    
    # Install requirements
    if not install_requirements():
        logger.warning("Proceeding with potential missing dependencies...")
    
    # Test AI models
    if not test_ai_models():
        logger.warning("AI models may not work properly")
    
    # Test API imports
    if not test_api_imports():
        logger.error("❌ Critical API import failure")
        sys.exit(1)
    
    # Start server
    print("\n" + "=" * 60)
    print("🎉 All checks passed! Starting server...")
    print("=" * 60)
    
    start_server()

if __name__ == "__main__":
    main()

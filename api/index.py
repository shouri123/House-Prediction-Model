import os
import sys

# Add the project root to sys.path to allow importing from backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.app import app

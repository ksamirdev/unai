import sys
import json
import numpy as np
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

def preprocess_image(img_path, target_size=(224, 224)):
    """Preprocess image for deepfake detection"""
    try:
        # Load and preprocess image
        img = cv2.imread(img_path)
        if img is None:
            raise ValueError("Could not load image")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize image
        img = cv2.resize(img, target_size)
        
        # Normalize pixel values
        img = img.astype('float32') / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def detect_deepfake(img_path, model_path='models/DeepFake.h5'):
    """Detect if image is deepfake using trained model"""
    try:
        # Load the trained model
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model = load_model(model_path)
        
        # Preprocess image
        processed_img = preprocess_image(img_path)
        
        # Make prediction
        prediction = model.predict(processed_img, verbose=0)
        
        # Get confidence score
        confidence = float(prediction[0][0])
        
        # Determine if deepfake (assuming model outputs 1 for deepfake, 0 for real)
        is_deepfake = confidence > 0.5
        
        return {
            'is_deepfake': is_deepfake,
            'confidence': confidence,
            'prediction_raw': confidence
        }
    
    except Exception as e:
        return {
            'error': str(e),
            'is_deepfake': False,
            'confidence': 0.0
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python app.py <image_path>'}))
        sys.exit(1)
    
    img_path = sys.argv[1]
    
    if not os.path.exists(img_path):
        print(json.dumps({'error': 'Image file not found'}))
        sys.exit(1)
    
    # Perform deepfake detection
    result = detect_deepfake(img_path)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

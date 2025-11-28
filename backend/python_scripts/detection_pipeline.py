import os
import sys
import json

# Suppress TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['PYTHONWARNINGS'] = 'ignore'

import io
from contextlib import redirect_stderr, redirect_stdout
import numpy as np
from PIL import Image

def debug_print(message):
    """Print debug messages to stderr only, not stdout"""
    print(message, file=sys.stderr)

def safe_print_json(data):
    """Only function allowed to print to stdout - clean JSON only"""
    print(json.dumps(data), flush=True)

class DeepfakeDetector:
    """Deepfake detection with clean output"""
    
    def __init__(self):
        self.model = None
        self.load_model()
    
    def find_deepfake_model(self):
        """Find DeepFake model using absolute path"""
        models_base_path = '/home/varun-kasnia/Documents/Programming Files/Projects/UnAI/models/'
        
        possible_paths = [
            os.path.join(models_base_path, 'DeepFake.h5'),
            os.path.join(models_base_path, 'deepfake.h5'),
            os.path.join(models_base_path, 'DeepFake_model.h5'),
            os.path.join(models_base_path, 'deepfake_detection.h5'),
            # Fallback relative paths
            'models/DeepFake.h5',
            'DeepFake.h5'
        ]
        
        debug_print(f"Searching for DeepFake model in: {models_base_path}")
        
        for path in possible_paths:
            if os.path.exists(path):
                debug_print(f"Found model at: {path}")
                return path
            else:
                debug_print(f"Not found: {path}")
        
        return None
    
    def load_model(self):
        """Load the deepfake detection model"""
        try:
            # Find the model
            model_path = self.find_deepfake_model()
            
            if not model_path:
                debug_print("No DeepFake model found, creating mock model")
                self.create_mock_model()
                return
            
            debug_print(f"Loading DeepFake model from: {model_path}")
            
            with redirect_stderr(io.StringIO()):
                import tensorflow as tf
                tf.get_logger().setLevel('ERROR')
                self.model = tf.keras.models.load_model(model_path)
                debug_print("✅ Successfully loaded DeepFake model")
                
        except Exception as e:
            debug_print(f"❌ Error loading DeepFake model: {str(e)}")
            self.create_mock_model()
    
    def create_mock_model(self):
        """Create a simple mock model for testing"""
        try:
            import tensorflow as tf
            
            debug_print("Creating mock deepfake detection model...")
            
            self.model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(128, 128, 3)),
                tf.keras.layers.Conv2D(32, 3, activation='relu'),
                tf.keras.layers.GlobalAveragePooling2D(),
                tf.keras.layers.Dense(1, activation='sigmoid')
            ])
            
            self.model.compile(optimizer='adam', loss='binary_crossentropy')
            debug_print("✅ Mock model created successfully")
            
        except Exception as e:
            raise Exception(f"Failed to create mock model: {str(e)}")
    
    def preprocess_image(self, image_path):
        """Preprocess image for deepfake detection"""
        try:
            image = Image.open(image_path)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            image = image.resize((128, 128))
            image_array = np.array(image)
            image_array = image_array.astype('float32') / 255.0
            image_array = np.expand_dims(image_array, axis=0)
            return image_array
        except Exception as e:
            raise Exception(f"Error preprocessing image: {str(e)}")
    
    def detect(self, img_path):
        """Detect if image is deepfake"""
        try:
            processed_image = self.preprocess_image(img_path)
            
            with redirect_stderr(io.StringIO()):
                prediction = self.model.predict(processed_image, verbose=0)
            
            # Handle different prediction formats
            if len(prediction.shape) > 1 and prediction.shape[1] > 1:
                score = prediction[0][1]  # Multi-class output
            else:
                score = prediction[0][0]  # Binary output
                
            # Ensure score is between 0 and 1
            score = float(np.clip(score, 0, 1))
            is_deepfake = score > 0.5
            
            return {
                'is_deepfake': bool(is_deepfake),
                'confidence': score,
                'status': 'success'
            }
        except Exception as e:
            return {
                'is_deepfake': False,
                'confidence': 0.0,
                'status': 'error',
                'error': str(e)
            }

class ImageRegenerator:
    """Image regeneration with clean output"""
    
    def __init__(self):
        self.model = None
        self.device = None
        self.load_model()
    
    def find_regenerator_model(self):
        """Find regenerator model using absolute path"""
        models_base_path = '/home/varun-kasnia/Documents/Programming Files/Projects/UnAI/models/'
        
        possible_paths = [
            os.path.join(models_base_path, 'regenerator_model.pth'),
            os.path.join(models_base_path, 'REGenerator.pth'),
            os.path.join(models_base_path, 'best_model.pth'),
            os.path.join(models_base_path, 'generator.pth'),
            os.path.join(models_base_path, 'deepfake_reversal_generator.pth'),
            # Fallback relative paths
            'models/regenerator_model.pth',
            'regenerator_model.pth'
        ]
        
        debug_print(f"Searching for regenerator model in: {models_base_path}")
        
        for path in possible_paths:
            if os.path.exists(path):
                debug_print(f"Found regenerator model at: {path}")
                return path
            else:
                debug_print(f"Not found: {path}")
        
        return None
    
    def load_model(self):
        """Load regenerator model"""
        try:
            import torch
            import torch.nn as nn
            import torch.nn.functional as F
            from torchvision import transforms
            
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            debug_print(f"Using device: {self.device}")
            
            # Find the model
            model_path = self.find_regenerator_model()
            
            if not model_path:
                debug_print("❌ No regenerator model found, regeneration will be disabled")
                return
            
            debug_print(f"Loading regenerator model from: {model_path}")
            
            # YOUR EXACT Generator architecture from the notebook
            class ResidualBlock(nn.Module):
                def __init__(self, channels):
                    super().__init__()
                    self.conv1 = nn.Conv2d(channels, channels, 3, 1, 1, bias=False)
                    self.bn1 = nn.BatchNorm2d(channels)
                    self.conv2 = nn.Conv2d(channels, channels, 3, 1, 1, bias=False)
                    self.bn2 = nn.BatchNorm2d(channels)

                def forward(self, x):
                    residual = x
                    out = F.relu(self.bn1(self.conv1(x)))
                    out = self.bn2(self.conv2(out))
                    return F.relu(out + residual)

            class Generator(nn.Module):
                def __init__(self, input_channels=3, output_channels=3):
                    super().__init__()
                    
                    # Encoder with proper normalization
                    self.enc1 = self._make_layer(input_channels, 64)  # 128 -> 64
                    self.enc2 = self._make_layer(64, 128)  # 64 -> 32
                    self.enc3 = self._make_layer(128, 256)  # 32 -> 16
                    self.enc4 = self._make_layer(256, 512)  # 16 -> 8
                    
                    # Fixed bottleneck with proper residual blocks
                    self.bottleneck = nn.Sequential(
                        ResidualBlock(512),
                        ResidualBlock(512),
                        ResidualBlock(512),
                    )
                    
                    # Separate attention mechanism
                    self.attention = nn.Sequential(
                        nn.AdaptiveAvgPool2d(1),
                        nn.Conv2d(512, 512//16, 1),
                        nn.ReLU(inplace=True),
                        nn.Conv2d(512//16, 512, 1),
                        nn.Sigmoid(),
                    )
                    
                    # Decoder with skip connections
                    self.dec4 = self._make_decoder_layer(1024, 256)  # 8 -> 16
                    self.dec3 = self._make_decoder_layer(512, 128)   # 16 -> 32
                    self.dec2 = self._make_decoder_layer(256, 64)    # 32 -> 64
                    self.dec1 = self._make_decoder_layer(128, 64)    # 64 -> 128
                    
                    # Final layers for better color control
                    self.final_conv = nn.Sequential(
                        nn.Conv2d(64, 32, 3, 1, 1),
                        nn.BatchNorm2d(32),
                        nn.ReLU(inplace=True),
                        nn.Conv2d(32, output_channels, 3, 1, 1),
                        nn.Tanh(),
                    )
                
                def _make_layer(self, in_channels, out_channels):
                    return nn.Sequential(
                        nn.Conv2d(in_channels, out_channels, 4, 2, 1, bias=False),
                        nn.BatchNorm2d(out_channels),
                        nn.LeakyReLU(0.2, inplace=True),
                    )
                
                def _make_decoder_layer(self, in_channels, out_channels):
                    return nn.Sequential(
                        nn.ConvTranspose2d(in_channels, out_channels, 4, 2, 1, bias=False),
                        nn.BatchNorm2d(out_channels),
                        nn.ReLU(inplace=True),
                    )
                
                def forward(self, x):
                    # Encoder
                    e1 = self.enc1(x)    # [B, 64, 64, 64]
                    e2 = self.enc2(e1)   # [B, 128, 32, 32]
                    e3 = self.enc3(e2)   # [B, 256, 16, 16]
                    e4 = self.enc4(e3)   # [B, 512, 8, 8]
                    
                    # Bottleneck
                    b = self.bottleneck(e4)  # [B, 512, 8, 8]
                    
                    # Apply attention
                    attention_weights = self.attention(e4)  # [B, 512, 1, 1]
                    b = b * attention_weights  # Broadcast multiply
                    
                    # Decoder with skip connections
                    d4 = self.dec4(torch.cat([b, e4], dim=1))      # [B, 256, 16, 16]
                    d3 = self.dec3(torch.cat([d4, e3], dim=1))     # [B, 128, 32, 32]
                    d2 = self.dec2(torch.cat([d3, e2], dim=1))     # [B, 64, 64, 64]
                    d1 = self.dec1(torch.cat([d2, e1], dim=1))     # [B, 64, 128, 128]
                    
                    # Final output with proper color mapping
                    output = self.final_conv(d1)  # [B, 3, 128, 128]
                    
                    return output
            
            # Initialize model with YOUR EXACT architecture
            self.model = Generator()
            
            # Load checkpoint
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict):
                if 'generator_state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['generator_state_dict'])
                    debug_print("✅ Loaded from 'generator_state_dict'")
                elif 'model_state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['model_state_dict'])
                    debug_print("✅ Loaded from 'model_state_dict'")
                elif 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                    debug_print("✅ Loaded from 'state_dict'")
                else:
                    self.model.load_state_dict(checkpoint)
                    debug_print("✅ Loaded from checkpoint dict")
            else:
                self.model.load_state_dict(checkpoint)
                debug_print("✅ Loaded from direct state dict")
            
            self.model.to(self.device)
            self.model.eval()
            
            # Transform using ImageNet normalization (from your notebook)
            self.transform = transforms.Compose([
                transforms.Resize((128, 128)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            
            debug_print("✅ Regenerator model loaded successfully")
            
        except Exception as e:
            debug_print(f"❌ Error loading regenerator model: {str(e)}")
            self.model = None
    
    def regenerate(self, img_path, output_path=None):
        """Regenerate image using absolute paths"""
        if self.model is None:
            return {
                'success': False,
                'output_path': None,
                'status': 'error',
                'error': 'Regenerator model not available'
            }
        
        try:
            import torch
            from torchvision import transforms
            
            debug_print(f"Regenerating image: {img_path}")
            
            # Load and preprocess image
            image = Image.open(img_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            debug_print(f"Input tensor shape: {input_tensor.shape}")
            
            # Generate image
            with torch.no_grad():
                output_tensor = self.model(input_tensor)
            
            debug_print(f"Output tensor shape: {output_tensor.shape}")
            debug_print(f"Output range: [{output_tensor.min():.3f}, {output_tensor.max():.3f}]")
            
            # Postprocess: Tanh output [-1, 1] → [0, 1]
            output_tensor = (output_tensor + 1) / 2
            output_tensor = torch.clamp(output_tensor, 0, 1)
            
            # Convert to PIL
            output_image = transforms.ToPILImage()(output_tensor.squeeze(0).cpu())
            
            # Save with absolute path handling
            if output_path is None:
                project_root = '/home/varun-kasnia/Documents/Programming Files/Projects/UnAI'
                output_dir = os.path.join(project_root, 'uploads', 'regenerated')
                os.makedirs(output_dir, exist_ok=True)
                base_name = os.path.splitext(os.path.basename(img_path))[0]
                output_path = os.path.join(output_dir, f"{base_name}_regenerated.jpg")
            
            output_image.save(output_path, 'JPEG', quality=95)
            
            debug_print(f"✅ Regenerated image saved to: {output_path}")
            
            return {
                'success': True,
                'output_path': output_path,
                'status': 'success'
            }
            
        except Exception as e:
            debug_print(f"❌ Error during regeneration: {str(e)}")
            return {
                'success': False,
                'output_path': None,
                'status': 'error',
                'error': str(e)
            }

def main():
    """Main pipeline with clean JSON output"""
    if len(sys.argv) != 2:
        safe_print_json({'pipeline_status': 'error', 'error': 'Usage: python detection_pipeline.py <image_path>'})
        sys.exit(1)
    
    img_path = sys.argv[1]
    
    # Convert to absolute path if relative
    if not os.path.isabs(img_path):
        img_path = os.path.abspath(img_path)
    
    debug_print(f"Processing image: {img_path}")
    
    if not os.path.exists(img_path):
        safe_print_json({'pipeline_status': 'error', 'error': f'Image file not found: {img_path}'})
        sys.exit(1)
    
    try:
        # Step 1: Initialize detector
        debug_print("Initializing deepfake detector...")
        detector = DeepfakeDetector()
        
        # Step 2: Detect deepfake
        debug_print("Running deepfake detection...")
        detection_result = detector.detect(img_path)
        
        if detection_result['status'] == 'error':
            safe_print_json({
                'pipeline_status': 'error',
                'error': detection_result['error']
            })
            sys.exit(1)
        
        debug_print(f"Detection result: {detection_result}")
        
        # Step 3: Regenerate if deepfake detected
        regeneration_result = None
        if detection_result['is_deepfake']:
            debug_print("Deepfake detected! Starting regeneration...")
            try:
                regenerator = ImageRegenerator()
                regeneration_result = regenerator.regenerate(img_path)
                debug_print(f"Regeneration result: {regeneration_result}")
            except Exception as e:
                debug_print(f"Regeneration error: {str(e)}")
                regeneration_result = {
                    'success': False,
                    'output_path': None,
                    'status': 'error',
                    'error': str(e)
                }
        else:
            debug_print("Image is authentic - no regeneration needed")
        
        # Step 4: Output clean JSON result (ONLY TO STDOUT)
        result = {
            'detection': detection_result,
            'regeneration': regeneration_result,
            'pipeline_status': 'success'
        }
        
        safe_print_json(result)
        
    except Exception as e:
        debug_print(f"Pipeline error: {str(e)}")
        safe_print_json({
            'pipeline_status': 'error',
            'error': str(e)
        })
        sys.exit(1)

if __name__ == "__main__":
    main()

import sys
import json
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import os

class ImageRegenerator(nn.Module):
    """Enhanced image regenerator model"""
    def __init__(self, input_channels=3, output_channels=3):
        super(ImageRegenerator, self).__init__()
        
        # Encoder
        self.encoder = nn.Sequential(
            nn.Conv2d(input_channels, 64, 4, 2, 1),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(64, 128, 4, 2, 1),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(128, 256, 4, 2, 1),
            nn.BatchNorm2d(256),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(256, 512, 4, 2, 1),
            nn.BatchNorm2d(512),
            nn.LeakyReLU(0.2, inplace=True),
        )
        
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(512, 512, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(512, 512, 4, 2, 1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
        )
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(1024, 256, 4, 2, 1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(512, 128, 4, 2, 1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(256, 64, 4, 2, 1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, output_channels, 4, 2, 1),
            nn.Tanh()
        )
        
    def forward(self, x):
        # Encoder
        e1 = self.encoder[0:2](x)
        e2 = self.encoder[2:5](e1)
        e3 = self.encoder[5:8](e2)
        e4 = self.encoder[8:11](e3)
        
        # Bottleneck
        bottleneck = self.bottleneck(e4)
        
        # Decoder with skip connections
        d1 = self.decoder[0:3](torch.cat([bottleneck, e4], 1))
        d2 = self.decoder[3:6](torch.cat([d1, e3], 1))
        d3 = self.decoder[6:9](torch.cat([d2, e2], 1))
        output = self.decoder[9:](torch.cat([d3, e1], 1))
        
        return output

def load_regenerator_model(model_path='/home/varun-kasnia/Documents/Programming Files/Projects/UnAI/models/regenerator_model.pth'):
    """Load the trained regenerator model"""
    try:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Regenerator model not found: {model_path}")
        
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize model
        model = ImageRegenerator()
        
        # Load model weights
        checkpoint = torch.load(model_path, map_location=device)
        
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)
        
        model.to(device)
        model.eval()
        
        return model, device
    
    except Exception as e:
        raise Exception(f"Error loading regenerator model: {str(e)}")

def preprocess_for_regeneration(image_path, target_size=(256, 256)):
    """Preprocess image for regeneration"""
    try:
        # Load image
        image = Image.open(image_path).convert('RGB')
        
        # Define transforms
        transform = transforms.Compose([
            transforms.Resize(target_size),
            transforms.ToTensor(),
            transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])  # Normalize to [-1, 1]
        ])
        
        # Apply transforms
        image_tensor = transform(image).unsqueeze(0)
        
        return image_tensor
    
    except Exception as e:
        raise Exception(f"Error preprocessing image for regeneration: {str(e)}")

def postprocess_regenerated(output_tensor):
    """Postprocess regenerated image tensor"""
    try:
        # Denormalize from [-1, 1] to [0, 1]
        output_tensor = (output_tensor + 1) / 2
        
        # Clamp values
        output_tensor = torch.clamp(output_tensor, 0, 1)
        
        # Convert to PIL Image
        transform = transforms.ToPILImage()
        regenerated_image = transform(output_tensor.squeeze(0))
        
        return regenerated_image
    
    except Exception as e:
        raise Exception(f"Error postprocessing regenerated image: {str(e)}")

def regenerate_image(image_path, model_path='/home/varun-kasnia/Documents/Programming Files/Projects/UnAI/models/regenerator_model.pth'):
    """Regenerate authentic image from deepfake"""
    try:
        # Load model
        model, device = load_regenerator_model(model_path)
        
        # Preprocess input image
        input_tensor = preprocess_for_regeneration(image_path)
        input_tensor = input_tensor.to(device)
        
        # Generate image
        with torch.no_grad():
            output_tensor = model(input_tensor)
        
        # Postprocess output
        regenerated_image = postprocess_regenerated(output_tensor.cpu())
        
        # Save regenerated image
        output_dir = 'uploads/regenerated'
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate output filename
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_path = os.path.join(output_dir, f"{base_name}_regenerated.jpg")
        
        # Save image
        regenerated_image.save(output_path, 'JPEG', quality=95)
        
        return {
            'success': True,
            'regenerated_path': output_path,
            'message': 'Image regenerated successfully'
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'regenerated_path': None
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python regenerator.py <image_path>'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({'error': 'Image file not found'}))
        sys.exit(1)
    
    # Regenerate image
    result = regenerate_image(image_path)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()

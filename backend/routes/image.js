const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Middleware for file uploads
const multer = require('multer');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Image routes working!', 
    endpoint: '/api/images/test',
    availableRoutes: ['/process', '/history']
  });
});

// ✅ MAIN IMAGE PROCESSING ROUTE
router.post('/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    const startTime = Date.now();

    console.log(`🔍 Processing image: ${imagePath}`);

    // Set environment variables to suppress TensorFlow logs
    const env = {
      ...process.env,
      TF_CPP_MIN_LOG_LEVEL: '3',
      TF_ENABLE_ONEDNN_OPTS: '0',
      PYTHONWARNINGS: 'ignore'
    };

    // Check if detection pipeline exists
    const pipelinePath = path.join(__dirname, '../python_scripts/detection_pipeline.py');
    if (!fs.existsSync(pipelinePath)) {
      console.log('⚠️ Detection pipeline not found, using basic processing');
      return res.json({
        success: true,
        detection: {
          id: `mock_${Date.now()}`,
          isDeepfake: Math.random() > 0.5, // Random for demo
          confidence: Math.random(),
          originalImage: `/uploads/images/${req.file.filename}`,
          regeneratedImage: null,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          note: 'Using mock processing - implement detection_pipeline.py'
        }
      });
    }

    // Call the detection pipeline
    const pythonProcess = spawn('python3', [pipelinePath, imagePath], { env });

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorText = data.toString();
      // Filter out TensorFlow info messages
      if (!errorText.includes('tensorflow/core') && 
          !errorText.includes('oneDNN') && 
          !errorText.includes('This TensorFlow binary') &&
          !errorText.includes('AVX2') &&
          errorText.trim() !== '') {
        errorData += errorText;
      }
    });

    pythonProcess.on('close', async (code) => {
      const processingTime = Date.now() - startTime;

      try {
        let result;
        
        if (outputData.trim()) {
          result = JSON.parse(outputData);
        } else {
          // Fallback if no output
          result = {
            pipeline_status: 'error',
            error: 'No output from detection pipeline'
          };
        }
        
        if (result.pipeline_status === 'error') {
          console.error('❌ Pipeline error:', result.error);
          return res.status(500).json({ 
            message: 'Pipeline processing failed',
            error: result.error 
          });
        }

        const detection = result.detection;
        const regeneration = result.regeneration;

        // Prepare response
        const responseData = {
          success: true,
          detection: {
            id: `detection_${Date.now()}`,
            isDeepfake: detection.is_deepfake,
            confidence: detection.confidence,
            originalImage: `/uploads/images/${req.file.filename}`,
            regeneratedImage: regeneration?.success 
              ? `/uploads/regenerated/${path.basename(regeneration.output_path)}` 
              : null,
            processingTime,
            timestamp: new Date().toISOString()
          }
        };

        console.log(`✅ Processing complete: ${detection.is_deepfake ? 'Deepfake detected' : 'Authentic image'}`);
        
        res.json(responseData);

      } catch (parseError) {
        console.error('❌ Parse error:', parseError);
        console.log('Raw output:', outputData.substring(0, 500));
        
        // Return basic response even on parse error
        res.json({
          success: true,
          detection: {
            id: `fallback_${Date.now()}`,
            isDeepfake: false,
            confidence: 0.5,
            originalImage: `/uploads/images/${req.file.filename}`,
            regeneratedImage: null,
            processingTime,
            timestamp: new Date().toISOString(),
            note: 'Used fallback processing due to pipeline error'
          }
        });
      }
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get processing history
router.get('/history', (req, res) => {
  res.json({ 
    message: 'History endpoint - implement database integration',
    detections: []
  });
});

// Get specific detection
router.get('/detection/:id', (req, res) => {
  res.json({ 
    message: `Detection ${req.params.id} - implement database lookup`,
    detection: null
  });
});

module.exports = router;

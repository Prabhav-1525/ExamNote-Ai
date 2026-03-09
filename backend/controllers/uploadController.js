const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');
const CardSet = require('../models/CardSet');
const User = require('../models/User');

const openai = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractText = async (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error('Unsupported file type');
};

const generateCards = async (text) => {
  const truncatedText = text.slice(0, 12000); // Stay within token limits

  const systemPrompt = `You are an expert educational content creator. Convert the provided study notes into structured study materials.
Generate a comprehensive JSON response with exactly this structure:
{
  "title": "Brief descriptive title of the content",
  "topic": "Main subject area",
  "tags": ["tag1", "tag2", "tag3"],
  "flashcards": [
    {
      "question": "Clear, specific question",
      "answer": "Concise, accurate answer",
      "difficulty": "easy|medium|hard"
    }
  ],
  "quickNotes": [
    {
      "topic": "Sub-topic name",
      "bullets": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
    }
  ],
  "soundCards": [
    {
      "title": "Topic for audio explanation",
      "script": "Natural spoken explanation suitable for text-to-speech playback. Write as if speaking to a student. Keep conversational and clear.",
      "duration": "~1 min"
    }
  ],
  "videoCards": [
    {
      "title": "Video concept title",
      "concept": "Core concept being explained",
      "script": "30-second explainer script with clear narration",
      "visualIdeas": ["Visual idea 1", "Visual idea 2", "Visual idea 3"],
      "duration": "30 sec",
      "youtubeQuery": "Search query to find related YouTube video"
    }
  ]
}

Requirements:
- Generate 8-15 flashcards covering key concepts
- Group quickNotes into 3-5 logical topics, max 5 bullets each
- Create 3-5 soundCards with natural speech scripts
- Create 2-4 videoCards with visual concepts
- Make all content accurate, educational, and engaging
- Return ONLY valid JSON, no markdown, no extra text`;

  const completion = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Convert these study notes into study cards:\n\n${truncatedText}` }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0].message.content;
  return JSON.parse(content);
};

const uploadAndProcess = async (req, res, next) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    filePath = req.file.path;
    const user = await User.findById(req.user._id);

    // Check upload rate limit
    if (!user.checkUploadLimit()) {
      fs.unlinkSync(filePath);
      return res.status(429).json({
        success: false,
        message: 'Upload limit reached. Free tier allows 3 uploads per hour.'
      });
    }

    // Create placeholder card set
    const cardSet = await CardSet.create({
      user: req.user._id,
      title: req.file.originalname.replace(/\.[^/.]+$/, ''),
      sourceFile: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      },
      status: 'processing'
    });

    // Send immediate response
    res.status(202).json({
      success: true,
      message: 'File uploaded, processing started',
      cardSetId: cardSet._id
    });

    // Process asynchronously
    try {
      const text = await extractText(filePath, req.file.mimetype);

      if (!text || text.trim().length < 50) {
        await CardSet.findByIdAndUpdate(cardSet._id, {
          status: 'error',
          errorMessage: 'Could not extract meaningful text from file'
        });
        return;
      }

      const generated = await generateCards(text);

      await CardSet.findByIdAndUpdate(cardSet._id, {
        title: generated.title || cardSet.title,
        topic: generated.topic || 'General',
        tags: generated.tags || [],
        flashcards: generated.flashcards || [],
        quickNotes: generated.quickNotes || [],
        soundCards: generated.soundCards || [],
        videoCards: generated.videoCards || [],
        status: 'ready'
      });

      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.totalCards': (generated.flashcards || []).length,
          'stats.filesProcessed': 1,
          'stats.uploadsThisHour': 1
        }
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);
      await CardSet.findByIdAndUpdate(cardSet._id, {
        status: 'error',
        errorMessage: processingError.message || 'AI processing failed'
      });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

  } catch (err) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    next(err);
  }
};

const getProcessingStatus = async (req, res, next) => {
  try {
    const cardSet = await CardSet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cardSet) {
      return res.status(404).json({ success: false, message: 'Card set not found' });
    }

    res.json({
      success: true,
      status: cardSet.status,
      errorMessage: cardSet.errorMessage,
      cardSet: cardSet.status === 'ready' ? cardSet : null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadAndProcess, getProcessingStatus };

# Social Blog AI Assistant

A multi-agentic AI system built with CrewAI framework for the social blogging platform. This system provides intelligent content generation, summarization, trend discovery, and context-aware chat capabilities.

## Features

### 🤖 Multi-Agent System
- **Trend Spotter**: Discovers emerging trends and hot topics
- **Content Summarizer**: Creates concise summaries of blog content
- **Post Editor**: Refines and improves blog post drafts
- **Chat Agent**: Provides context-aware responses limited to blog content

### 🔍 RAG (Retrieval-Augmented Generation)
- Vector store using ChromaDB
- Semantic search over blog content
- Context-aware responses
- Automatic embedding generation

### 🌐 API Endpoints
- `POST /api/ai/trends` - Get trending topics
- `POST /api/ai/summarize` - Summarize content
- `POST /api/ai/edit` - Edit blog posts
- `POST /api/ai/generate` - Generate new blog content
- `POST /api/ai/chat` - Interactive chat with AI
- `POST /api/ai/blog-posts` - Add posts to knowledge base
- `GET /api/ai/blog-posts` - Get all posts metadata
- `GET /api/ai/health` - Health check

## Setup

### Prerequisites
- Python 3.13+
- UV package manager (recommended) or pip
- Google API key (Gemini)
- Tavily API key (for web search)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd chatbot-api
   ```

2. **Install dependencies:**
   ```bash
   # Using UV (recommended)
   uv sync

   # Or using pip
   pip install -e .
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run the application:**
   ```bash
   # Using UV
   uv run uvicorn main:app --reload

   # Or using Python directly
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

### Authentication
Currently, the API doesn't require authentication for testing. In production, implement proper JWT authentication.

### Request/Response Format

All endpoints return responses in this format:
```json
{
  "success": boolean,
  "data": any,
  "message": string
}
```

### Example Usage

#### Get Trending Topics
```bash
curl -X POST "http://localhost:8000/api/ai/trends" \
  -H "Content-Type: application/json" \
  -d '{"topic": "artificial intelligence"}'
```

#### Summarize Content
```bash
curl -X POST "http://localhost:8000/api/ai/summarize" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your long blog post content here...",
    "desired_length": "one paragraph"
  }'
```

#### Chat with AI
```bash
curl -X POST "http://localhost:8000/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the latest trends in web development?",
    "chat_history": ""
  }'
```

#### Add Blog Post to Knowledge Base
```bash
curl -X POST "http://localhost:8000/api/ai/blog-posts" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "unique-post-id",
    "title": "My Blog Post Title",
    "content": "Blog post content...",
    "author": "Author Name",
    "tags": ["web-dev", "react"],
    "metadata": {"category": "tutorial"}
  }'
```

## Docker Deployment

### Build Docker Image
```bash
docker build -t social-blog-ai .
```

### Run Container
```bash
docker run -p 8000:8000 \
  -e GOOGLE_API_KEY=your_key \
  -e TAVILY_API_KEY=your_key \
  social-blog-ai
```

### Docker Compose (recommended)
```yaml
version: '3.8'
services:
  ai-backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - TAVILY_API_KEY=${TAVILY_API_KEY}
    volumes:
      - ./chroma_db:/app/chroma_db
```

## Deployment to Cloud

### Render/Railway Deployment

1. **Connect your GitHub repository**
2. **Set environment variables:**
   - `GOOGLE_API_KEY`
   - `TAVILY_API_KEY`
   - `APP_ENV=production`

3. **Use the Dockerfile** for deployment
4. **Set the start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Production
```bash
GOOGLE_API_KEY=your_production_google_key
TAVILY_API_KEY=your_production_tavily_key
APP_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
PORT=8000
```

## Integration with Frontend

### CORS Configuration
The API is configured to allow requests from any origin during development. For production, update the `ALLOWED_ORIGINS` environment variable.

### Frontend Integration Example (React)

```javascript
// Chat component integration
const sendMessage = async (message) => {
  try {
    const response = await fetch('http://localhost:8000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        chat_history: chatHistory
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setChatMessages(prev => [...prev, {
        user: message,
        assistant: data.data.response
      }]);
    }
  } catch (error) {
    console.error('Chat error:', error);
  }
};

// Summarize content
const summarizePost = async (content) => {
  try {
    const response = await fetch('http://localhost:8000/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        desired_length: "two sentences"
      })
    });
    
    const data = await response.json();
    return data.success ? data.data.summary : null;
  } catch (error) {
    console.error('Summarization error:', error);
    return null;
  }
};
```

## Architecture

### Multi-Agent System Flow
1. **User Request** → API Endpoint
2. **Task Creation** → Specific agent assignment
3. **Agent Execution** → LLM processing with tools
4. **Result Processing** → Format and return response

### RAG System Flow
1. **Blog Posts** → Vector embeddings → ChromaDB
2. **User Query** → Similarity search → Retrieved context
3. **Context + Query** → LLM → Contextual response

## Testing

### Manual Testing with curl
Use the curl examples above to test individual endpoints.

### Health Check
```bash
curl http://localhost:8000/api/ai/health
```

### Load Testing
For production readiness, consider using tools like:
- `wrk` for HTTP load testing
- `pytest` for unit tests
- `locust` for more complex load testing scenarios

## Monitoring and Logging

The application uses Python's built-in logging. In production, consider:
- Structured logging (JSON format)
- Log aggregation (ELK stack, Datadog)
- Application monitoring (Sentry)
- Performance monitoring (New Relic)

## Troubleshooting

### Common Issues

1. **ChromaDB Permission Error**
   ```bash
   mkdir -p ./chroma_db
   chmod 755 ./chroma_db
   ```

2. **API Key Not Found**
   - Ensure `.env` file is properly configured
   - Check environment variable names match exactly

3. **CORS Issues**
   - Verify frontend domain is in `ALLOWED_ORIGINS`
   - Check that requests include proper headers

4. **Memory Issues**
   - Limit chat history length
   - Reduce vector store results
   - Implement proper cleanup

### Debug Mode
Set `LOG_LEVEL=DEBUG` in your environment to get more detailed logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is part of the Social Blogging App educational project.

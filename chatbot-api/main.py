from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import os

# Import our AI modules
from ai.crew import (
    execute_trend_discovery,
    execute_content_summary,
    execute_post_editing,
    execute_blog_generation,
    execute_chat_response,
    execute_trend_based_writing
)
from ai.rag_system import get_rag_system

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Social Blog AI Assistant",
    description="AI-powered backend for social blogging platform with multi-agent capabilities",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
rag_system = get_rag_system()

# --- PYDANTIC MODELS ---

class TrendRequest(BaseModel):
    topic: str

class SummarizeRequest(BaseModel):
    content: str
    desired_length: Optional[str] = "one paragraph"

class EditPostRequest(BaseModel):
    draft_content: str
    editing_goal: str

class GenerateBlogRequest(BaseModel):
    topic: str
    keywords: str
    target_audience: str

class ChatRequest(BaseModel):
    message: str
    chat_history: Optional[str] = ""

class TrendBasedWritingRequest(BaseModel):
    trend_topic: str
    target_audience: Optional[str] = "general readers"
    post_length: Optional[str] = "medium-length"

class BlogPostData(BaseModel):
    post_id: str
    title: str
    content: str
    author: str
    tags: Optional[List[str]] = []
    metadata: Optional[Dict[str, Any]] = {}

class APIResponse(BaseModel):
    success: bool
    data: Any
    message: str

# --- SESSION MANAGEMENT ---
# Simple in-memory session storage (in production, use Redis or database)
chat_sessions: Dict[str, List[Dict[str, str]]] = {}

def get_or_create_session(session_id: str = "default") -> List[Dict[str, str]]:
    """Get or create a chat session."""
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
    return chat_sessions[session_id]

def add_to_session(session_id: str, user_message: str, ai_response: str):
    """Add a message pair to the session."""
    session = get_or_create_session(session_id)
    session.append({
        "user": user_message,
        "assistant": ai_response,
        "timestamp": datetime.now().isoformat()
    })
    
    # Keep only last 10 exchanges to manage memory
    if len(session) > 10:
        session.pop(0)

def format_chat_history(session: List[Dict[str, str]]) -> str:
    """Format chat history for AI context."""
    if not session:
        return "No previous conversation."
    
    history_parts = []
    for exchange in session[-5:]:  # Last 5 exchanges
        history_parts.append(f"User: {exchange['user']}")
        history_parts.append(f"Assistant: {exchange['assistant']}")
    
    return "\n".join(history_parts)

# --- API ENDPOINTS ---

@app.get("/")
def home():
    """Health check endpoint."""
    return {
        "message": "Social Blog AI Assistant is running",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/ai/trends", response_model=APIResponse)
async def get_trends(request: TrendRequest):
    """Get trending topics for a given subject."""
    try:
        logger.info(f"Getting trends for topic: {request.topic}")
        
        result = execute_trend_discovery(request.topic)
        
        return APIResponse(
            success=True,
            data={"trends": str(result)},
            message=f"Successfully retrieved trends for '{request.topic}'"
        )
        
    except Exception as e:
        logger.error(f"Error getting trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get trends: {str(e)}"
        )

@app.post("/api/ai/summarize", response_model=APIResponse)
async def summarize_content(request: SummarizeRequest):
    """Summarize blog content."""
    try:
        logger.info(f"Summarizing content of length: {len(request.content)}")
        
        result = execute_content_summary(request.content, request.desired_length)
        
        return APIResponse(
            success=True,
            data={"summary": str(result)},
            message="Content summarized successfully"
        )
        
    except Exception as e:
        logger.error(f"Error summarizing content: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to summarize content: {str(e)}"
        )

@app.post("/api/ai/edit", response_model=APIResponse)
async def edit_post(request: EditPostRequest):
    """Edit blog post content based on instructions."""
    try:
        logger.info(f"Editing post with goal: {request.editing_goal}")
        
        result = execute_post_editing(request.draft_content, request.editing_goal)
        
        return APIResponse(
            success=True,
            data={"edited_content": str(result)},
            message="Post edited successfully"
        )
        
    except Exception as e:
        logger.error(f"Error editing post: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to edit post: {str(e)}"
        )

@app.post("/api/ai/generate", response_model=APIResponse)
async def generate_blog(request: GenerateBlogRequest):
    """Generate a new blog post draft."""
    try:
        logger.info(f"Generating blog for topic: {request.topic}")
        
        result = execute_blog_generation(
            request.topic,
            request.keywords,
            request.target_audience
        )
        
        return APIResponse(
            success=True,
            data={"generated_content": str(result)},
            message="Blog post generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error generating blog: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate blog: {str(e)}"
        )

@app.post("/api/ai/chat", response_model=APIResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant (scoped to blog content)."""
    try:
        session_id = "default"  # In production, get from auth token or session
        logger.info(f"Processing chat message: {request.message[:50]}...")
        
        # Get chat history
        session = get_or_create_session(session_id)
        chat_history = format_chat_history(session)
        
        # Get relevant context from RAG system
        retrieved_context = rag_system.get_context_for_chat(request.message)
        
        # Execute chat response
        result = execute_chat_response(
            chat_history=chat_history,
            retrieved_context=retrieved_context,
            user_question=request.message
        )
        
        ai_response = str(result)
        
        # Add to session
        add_to_session(session_id, request.message, ai_response)
        
        return APIResponse(
            success=True,
            data={
                "response": ai_response,
                "context_used": len(retrieved_context) > 50  # Indicate if context was found
            },
            message="Chat response generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat: {str(e)}"
        )

@app.post("/api/ai/trend-write", response_model=APIResponse)
async def trend_based_writing(request: TrendBasedWritingRequest):
    """Research trends and write a blog post based on a trending topic."""
    try:
        logger.info(f"Processing trend-based writing for: {request.trend_topic}")
        
        # Execute trend-based writing (research + write in one step)
        result = execute_trend_based_writing(
            trend_topic=request.trend_topic,
            target_audience=request.target_audience,
            post_length=request.post_length
        )
        
        blog_post = str(result)
        
        return APIResponse(
            success=True,
            data={
                "blog_post": blog_post,
                "trend_topic": request.trend_topic,
                "target_audience": request.target_audience,
                "post_length": request.post_length
            },
            message="Trend-based blog post generated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in trend-based writing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate trend-based content: {str(e)}"
        )

# --- BLOG POST MANAGEMENT ENDPOINTS ---

@app.post("/api/ai/blog-posts", response_model=APIResponse)
async def add_blog_post(request: BlogPostData):
    """Add a blog post to the knowledge base."""
    try:
        logger.info(f"Adding blog post: {request.title}")
        
        success = rag_system.add_blog_post(
            post_id=request.post_id,
            title=request.title,
            content=request.content,
            author=request.author,
            tags=request.tags,
            metadata=request.metadata
        )
        
        if success:
            return APIResponse(
                success=True,
                data={"post_id": request.post_id},
                message="Blog post added to knowledge base successfully"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to add blog post to knowledge base"
            )
            
    except Exception as e:
        logger.error(f"Error adding blog post: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add blog post: {str(e)}"
        )

@app.get("/api/ai/blog-posts", response_model=APIResponse)
async def get_all_blog_posts():
    """Get all blog posts metadata from knowledge base."""
    try:
        posts_metadata = rag_system.get_all_posts_metadata()
        
        return APIResponse(
            success=True,
            data={"posts": posts_metadata, "count": len(posts_metadata)},
            message=f"Retrieved {len(posts_metadata)} blog posts"
        )
        
    except Exception as e:
        logger.error(f"Error getting blog posts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get blog posts: {str(e)}"
        )

@app.get("/api/ai/blog-posts/{post_id}", response_model=APIResponse)
async def get_blog_post(post_id: str):
    """Get a specific blog post by ID."""
    try:
        post = rag_system.get_post_by_id(post_id)
        
        if post:
            return APIResponse(
                success=True,
                data={"post": post},
                message="Blog post retrieved successfully"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Blog post {post_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting blog post {post_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get blog post: {str(e)}"
        )

@app.delete("/api/ai/blog-posts/{post_id}", response_model=APIResponse)
async def delete_blog_post(post_id: str):
    """Delete a blog post from knowledge base."""
    try:
        success = rag_system.delete_blog_post(post_id)
        
        if success:
            return APIResponse(
                success=True,
                data={"post_id": post_id},
                message="Blog post deleted successfully"
            )
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Blog post {post_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting blog post {post_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete blog post: {str(e)}"
        )

# --- UTILITY ENDPOINTS ---

@app.get("/api/ai/health")
async def health_check():
    """Detailed health check endpoint."""
    try:
        # Test RAG system
        posts_count = len(rag_system.get_all_posts_metadata())
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "rag_system": "operational",
                "vector_store": "operational",
                "knowledge_base_posts": posts_count
            },
            "version": "1.0.0"
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/api/ai/stats")
async def get_stats():
    """Get AI system statistics."""
    try:
        posts_count = len(rag_system.get_all_posts_metadata())
        sessions_count = len(chat_sessions)
        
        return APIResponse(
            success=True,
            data={
                "knowledge_base_posts": posts_count,
                "active_chat_sessions": sessions_count,
                "total_exchanges": sum(len(session) for session in chat_sessions.values())
            },
            message="Statistics retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get stats: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
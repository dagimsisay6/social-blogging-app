"""
Blog RAG Tool using CrewAI's built-in RagTool.
This provides a simpler approach to give agents access to blog content.
"""

from crewai_tools import RagTool
from .rag_system import get_rag_system
import logging

logger = logging.getLogger(__name__)

def create_blog_rag_tool():
    """
    Creates and configures a RAG tool for blog content retrieval.
    Uses CrewAI's built-in RagTool for better integration.
    """
    # Initialize the RagTool with minimal configuration
    # Let's start simple and add configuration later if needed
    rag_tool = RagTool(summarize=False)
    
    logger.info("Blog RAG tool created successfully")
    return rag_tool

def populate_rag_tool_with_blogs(rag_tool, blog_posts):
    """
    Populate the RAG tool with blog post content.
    
    Args:
        rag_tool: The RagTool instance
        blog_posts: List of blog post dictionaries with title, content, tags
    """
    successful_adds = 0
    
    for post in blog_posts:
        # Create a formatted text representation of the blog post
        post_text = f"""
Title: {post.get('title', 'Untitled')}

Content: {post.get('content', '')}

Tags: {', '.join(post.get('tags', []))}

Author: {post.get('author', 'Unknown')}

Date: {post.get('created_at', 'Unknown')}
        """
        
        # Add the blog post as text data to the RAG tool
        try:
            rag_tool.add(data_type="text", content=post_text.strip())
            successful_adds += 1
        except Exception as e:
            logger.error(f"Error adding blog post '{post.get('title', 'Unknown')}' to RAG tool: {e}")
    
    logger.info(f"Successfully added {successful_adds} blog posts to RAG tool")
    return successful_adds

def get_blog_rag_tool():
    """
    Creates a RAG tool and attempts to populate it with existing blog data.
    Returns a configured RAG tool ready for use by agents.
    """
    rag_tool = create_blog_rag_tool()
    
    # Try to get existing blog posts from our RAG system and populate the tool
    try:
        rag_system = get_rag_system()
        
        # Check if we have any blog posts in our vector store
        # For now, we'll start with an empty tool and populate it as blog posts are added
        logger.info("Blog RAG tool initialized and ready for use")
        
    except Exception as e:
        logger.warning(f"Could not initialize RAG system for blog data: {e}")
    
    return rag_tool

# Global instance for reuse
_blog_rag_tool = None

def get_shared_blog_rag_tool():
    """
    Get a shared instance of the blog RAG tool.
    This ensures all agents use the same knowledge base.
    """
    global _blog_rag_tool
    if _blog_rag_tool is None:
        _blog_rag_tool = get_blog_rag_tool()
    return _blog_rag_tool

def add_blog_to_shared_tool(blog_post):
    """
    Add a single blog post to the shared RAG tool.
    
    Args:
        blog_post: Dictionary containing blog post data
    """
    tool = get_shared_blog_rag_tool()
    populate_rag_tool_with_blogs(tool, [blog_post])

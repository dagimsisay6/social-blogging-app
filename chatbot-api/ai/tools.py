"""
Custom CrewAI tool for blog knowledge base retrieval.
This tool wraps the RAG system to provide blog context to agents.
"""

from crewai.tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field
from ai.rag_system import get_rag_system
import logging

logger = logging.getLogger(__name__)

class BlogSearchInput(BaseModel):
    """Input schema for blog search tool."""
    query: str = Field(..., description="The search query to find relevant blog posts")

class BlogRetrievalTool(BaseTool):
    """
    Tool for searching and retrieving relevant blog posts from the knowledge base.
    This tool uses semantic search to find blog content related to the user's query.
    """
    
    name: str = "blog_knowledge_search"
    description: str = (
        "Search the blog knowledge base for relevant content. "
        "Use this tool to find blog posts related to the user's question. "
        "Input should be a search query describing what you're looking for."
    )
    args_schema: Type[BaseModel] = BlogSearchInput

    def _run(self, query: str) -> str:
        """
        Execute the blog search and return relevant context.
        
        Args:
            query: The search query to find relevant blog posts
            
        Returns:
            Formatted context from relevant blog posts or indication that no content was found
        """
        try:
            # Get the RAG system instance
            rag_system = get_rag_system()
            
            # Search for relevant context
            context = rag_system.get_context_for_chat(query, max_results=3)
            
            logger.info(f"Retrieved context for query: {query[:50]}...")
            
            # Add explicit instruction to prevent hallucination
            formatted_context = f"""RETRIEVED BLOG CONTENT (DO NOT ADD OR INVENT ADDITIONAL CONTENT):

{context}

IMPORTANT: The above is the COMPLETE list of relevant blog content found. Do not invent, add, or reference any blog posts not explicitly shown above."""
            
            return formatted_context
            
        except Exception as e:
            logger.error(f"Error in blog retrieval tool: {str(e)}")
            return f"Error retrieving blog content: {str(e)}"

# Create a global instance of the tool
blog_retrieval_tool = BlogRetrievalTool()

def get_blog_retrieval_tool() -> BlogRetrievalTool:
    """Get the blog retrieval tool instance."""
    return blog_retrieval_tool

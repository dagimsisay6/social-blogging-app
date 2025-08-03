"""
RAG (Retrieval-Augmented Generation) System for Blog Knowledge Base
This module handles the vector store, embeddings, and retrieval logic.
"""

import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any
import os
import json
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlogRAGSystem:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize the RAG system with ChromaDB and Google embeddings."""
        self.persist_directory = persist_directory
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Use Google's embedding API
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            logger.warning("GOOGLE_API_KEY not found, falling back to default embeddings")
            self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        else:
            try:
                # Use Google's text embedding model via API
                self.embedding_function = embedding_functions.GoogleGenerativeAiEmbeddingFunction(
                    api_key=google_api_key,
                    model_name="models/text-embedding-004"  # Latest Google embedding model
                )
                logger.info("Using Google Generative AI embeddings (text-embedding-004)")
            except Exception as e:
                logger.error(f"Failed to initialize Google embeddings: {e}")
                logger.info("Falling back to default embeddings")
                self.embedding_function = embedding_functions.DefaultEmbeddingFunction()
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="blog_posts",
            embedding_function=self.embedding_function
        )
        
        logger.info(f"Initialized RAG system with collection: {self.collection.name}")
    
    def add_blog_post(self, post_id: str, title: str, content: str, author: str, 
                     tags: List[str] = None, metadata: Dict[str, Any] = None):
        """Add a blog post to the vector store."""
        try:
            # Prepare document text (combine title and content for better retrieval)
            document_text = f"Title: {title}\n\nContent: {content}"
            
            # Prepare metadata
            post_metadata = {
                "post_id": post_id,
                "title": title,
                "author": author,
                "tags": ", ".join(tags) if tags else "",  # Convert list to string
                "created_at": datetime.now().isoformat(),
                **(metadata or {})
            }
            
            # Add to collection
            self.collection.add(
                documents=[document_text],
                metadatas=[post_metadata],
                ids=[post_id]
            )
            
            logger.info(f"Added blog post {post_id} to vector store")
            return True
            
        except Exception as e:
            logger.error(f"Error adding blog post {post_id}: {str(e)}")
            return False
    
    def search_similar_posts(self, query: str, n_results: int = 5, 
                           include_metadata: bool = True) -> List[Dict[str, Any]]:
        """Search for similar blog posts based on query."""
        try:
            # Perform similarity search
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                include=['documents', 'metadatas', 'distances'] if include_metadata else ['documents']
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    result = {
                        'content': doc,
                        'similarity_score': 1 - results['distances'][0][i],  # Convert distance to similarity
                    }
                    
                    if include_metadata and results['metadatas'][0][i]:
                        result['metadata'] = results['metadatas'][0][i]
                    
                    formatted_results.append(result)
            
            logger.info(f"Found {len(formatted_results)} similar posts for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching for similar posts: {str(e)}")
            return []
    
    def get_post_by_id(self, post_id: str) -> Dict[str, Any]:
        """Retrieve a specific post by ID."""
        try:
            result = self.collection.get(
                ids=[post_id],
                include=['documents', 'metadatas']
            )
            
            if result['documents'] and result['documents'][0]:
                return {
                    'content': result['documents'][0],
                    'metadata': result['metadatas'][0] if result['metadatas'] else {}
                }
            else:
                return {}
                
        except Exception as e:
            logger.error(f"Error retrieving post {post_id}: {str(e)}")
            return {}
    
    def update_blog_post(self, post_id: str, title: str = None, content: str = None, 
                        metadata: Dict[str, Any] = None):
        """Update an existing blog post."""
        try:
            # Get existing post
            existing = self.get_post_by_id(post_id)
            if not existing:
                logger.warning(f"Post {post_id} not found for update")
                return False
            
            # Update document text if title or content provided
            if title or content:
                existing_metadata = existing.get('metadata', {})
                new_title = title or existing_metadata.get('title', '')
                new_content = content or existing['content'].split('\n\nContent: ', 1)[-1]
                
                document_text = f"Title: {new_title}\n\nContent: {new_content}"
                
                # Update metadata
                updated_metadata = existing_metadata.copy()
                if title:
                    updated_metadata['title'] = title
                if metadata:
                    updated_metadata.update(metadata)
                updated_metadata['updated_at'] = datetime.now().isoformat()
                
                # Update in collection
                self.collection.update(
                    ids=[post_id],
                    documents=[document_text],
                    metadatas=[updated_metadata]
                )
            
            logger.info(f"Updated blog post {post_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating post {post_id}: {str(e)}")
            return False
    
    def delete_blog_post(self, post_id: str):
        """Delete a blog post from the vector store."""
        try:
            self.collection.delete(ids=[post_id])
            logger.info(f"Deleted blog post {post_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting post {post_id}: {str(e)}")
            return False
    
    def get_all_posts_metadata(self) -> List[Dict[str, Any]]:
        """Get metadata for all posts in the collection."""
        try:
            result = self.collection.get(include=['metadatas'])
            return result['metadatas'] if result['metadatas'] else []
            
        except Exception as e:
            logger.error(f"Error getting all posts metadata: {str(e)}")
            return []
    
    def search_by_tags(self, tags: List[str], n_results: int = 10) -> List[Dict[str, Any]]:
        """Search posts by tags."""
        try:
            # Create a query string from tags
            tag_query = " ".join(tags)
            
            results = self.collection.query(
                query_texts=[tag_query],
                n_results=n_results,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Filter results that actually contain the tags
            filtered_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    metadata = results['metadatas'][0][i] if results['metadatas'][0] else {}
                    post_tags = metadata.get('tags', [])
                    
                    # Check if any of the search tags match post tags
                    if any(tag.lower() in [t.lower() for t in post_tags] for tag in tags):
                        filtered_results.append({
                            'content': doc,
                            'metadata': metadata,
                            'similarity_score': 1 - results['distances'][0][i]
                        })
            
            logger.info(f"Found {len(filtered_results)} posts with tags: {tags}")
            return filtered_results
            
        except Exception as e:
            logger.error(f"Error searching by tags {tags}: {str(e)}")
            return []
    
    def get_context_for_chat(self, user_question: str, max_results: int = 3) -> str:
        """Get relevant context for chat agent based on user question."""
        try:
            # Search for relevant posts
            results = self.search_similar_posts(user_question, n_results=max_results)
            
            if not results:
                return "No relevant blog content found for this question."
            
            # Format context
            context_parts = []
            for i, result in enumerate(results, 1):
                metadata = result.get('metadata', {})
                title = metadata.get('title', 'Untitled')
                content = result['content']
                
                # Extract just the content part (remove "Title: " prefix)
                if content.startswith('Title: '):
                    content = content.split('\n\nContent: ', 1)[-1]
                
                context_parts.append(f"Blog Post {i}: {title}\n{content}\n")
            
            context = "Based on the following blog posts from our knowledge base:\n\n" + "\n---\n".join(context_parts)
            
            logger.info(f"Retrieved context from {len(results)} posts for question: {user_question[:50]}...")
            return context
            
        except Exception as e:
            logger.error(f"Error getting context for chat: {str(e)}")
            return "Error retrieving relevant blog content."

# Initialize global RAG system instance
rag_system = BlogRAGSystem()

def get_rag_system() -> BlogRAGSystem:
    """Get the global RAG system instance."""
    return rag_system

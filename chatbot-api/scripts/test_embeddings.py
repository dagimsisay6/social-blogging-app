#!/usr/bin/env python3
"""
Test script for embedding and search functionality
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== AI System Testing ===")
print()

# 1. Environment Check
print("1. Environment Variables:")
google_key = os.getenv('GOOGLE_API_KEY')
if google_key:
    print(f"✅ GOOGLE_API_KEY found: {google_key[:10]}...")
else:
    print("❌ GOOGLE_API_KEY not found - will use local embeddings")

tavily_key = os.getenv('TAVILY_API_KEY') 
if tavily_key:
    print(f"✅ TAVILY_API_KEY found: {tavily_key[:10]}...")
else:
    print("❌ TAVILY_API_KEY not found")
print()

# 2. Test RAG System
print("2. Testing RAG System:")
try:
    from ai.rag_system import get_rag_system
    rag_system = get_rag_system()
    print("✅ RAG system initialized")
    print(f"   Collection: {rag_system.collection.name}")
    print(f"   Embedding type: {type(rag_system.embedding_function).__name__}")
    
    # Check if it's using Google embeddings
    if "Google" in type(rag_system.embedding_function).__name__:
        print("✅ Using Google embeddings (API-based)")
    else:
        print("⚠️  Using default embeddings (local model)")
        
except Exception as e:
    print(f"❌ RAG system failed: {e}")
    sys.exit(1)
print()

# 3. Test Adding Blog Post
print("3. Testing Blog Post Addition:")
try:
    # Add a test blog post
    result = rag_system.add_blog_post(
        post_id="test-embedding-1",
        title="Testing AI Embeddings",
        content="This is a test blog post about artificial intelligence, machine learning, and natural language processing. We are testing semantic search capabilities.",
        author="Test Author",
        tags=["AI", "testing", "embeddings"]
    )
    
    if result:
        print("✅ Blog post added successfully")
    else:
        print("❌ Failed to add blog post")
        
except Exception as e:
    print(f"❌ Adding blog post failed: {e}")
print()

# 4. Test Search
print("4. Testing Semantic Search:")
try:
    # Test search queries
    test_queries = [
        "artificial intelligence",
        "machine learning algorithms", 
        "natural language processing",
        "completely unrelated topic"
    ]
    
    for query in test_queries:
        results = rag_system.search_similar_posts(query, n_results=2)
        print(f"   Query: '{query}' -> {len(results)} results")
        
        if results:
            for i, result in enumerate(results):
                score = result.get('similarity_score', 0)
                title = result.get('metadata', {}).get('title', 'No title')
                print(f"     Result {i+1}: {title} (score: {score:.3f})")
        else:
            print("     No results found")
        print()
            
except Exception as e:
    print(f"❌ Search testing failed: {e}")

# 5. Test Chat Context
print("5. Testing Chat Context Retrieval:")
try:
    context = rag_system.get_context_for_chat("What can you tell me about AI?", max_results=2)
    print("✅ Context retrieved:")
    print(f"   Length: {len(context)} characters")
    print(f"   Preview: {context[:200]}...")
    
except Exception as e:
    print(f"❌ Chat context failed: {e}")

print()
print("=== Test Complete ===")

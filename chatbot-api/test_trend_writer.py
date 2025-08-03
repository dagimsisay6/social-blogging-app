#!/usr/bin/env python3
"""
Test the new trend-based writing agent
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from ai.crew import execute_trend_based_writing

def test_trend_based_writing():
    print("=== Testing Trend-Based Writing Agent ===")
    print()
    
    # Test with a trending topic
    print("Testing with trend topic: 'AI chatbots'")
    print("Target audience: 'tech entrepreneurs'")
    print("Post length: 'medium-length'")
    print()
    print("Generating content... (this may take a minute)")
    print()
    
    try:
        result = execute_trend_based_writing(
            trend_topic="AI chatbots",
            target_audience="tech entrepreneurs",
            post_length="medium-length"
        )
        
        print("✅ SUCCESS! Generated blog post:")
        print("=" * 50)
        print(result)
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_trend_based_writing()

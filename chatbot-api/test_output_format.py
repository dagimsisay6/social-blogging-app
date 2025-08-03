#!/usr/bin/env python3
"""
Test the output format of the trend-based writing to ensure it's plain text
"""

def test_api_format():
    """Test the API format by making a request to the trend-write endpoint"""
    import requests
    import json
    
    url = "http://localhost:8000/api/ai/trend-write"
    
    payload = {
        "trend_topic": "sustainable technology",
        "target_audience": "general readers",
        "post_length": "short"
    }
    
    try:
        print("🧪 Testing trend-write API endpoint for output format...")
        print(f"📍 Making request to: {url}")
        print(f"📝 Payload: {json.dumps(payload, indent=2)}")
        print()
        
        response = requests.post(url, json=payload, timeout=120)
        
        if response.status_code == 200:
            data = response.json()
            blog_post = data.get("data", {}).get("blog_post", "")
            
            print("✅ API Response successful!")
            print("=" * 60)
            print("📄 BLOG POST CONTENT:")
            print("=" * 60)
            print(blog_post)
            print("=" * 60)
            
            # Check for HTML tags
            html_indicators = ["<h1>", "<h2>", "<p>", "<div>", "<br>", "</h1>", "</h2>", "</p>", "</div>"]
            html_found = any(tag.lower() in blog_post.lower() for tag in html_indicators)
            
            if html_found:
                print("⚠️  WARNING: HTML tags detected in output!")
                print("This may not display correctly in the frontend.")
            else:
                print("✅ SUCCESS: Output appears to be clean plain text!")
                print("This should display correctly in the frontend.")
            
            return blog_post
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

if __name__ == "__main__":
    print("=== Output Format Test ===")
    print("This test checks if the AI generates plain text instead of HTML")
    print()
    
    # Check if server is running
    try:
        import requests
        health_check = requests.get("http://localhost:8000/", timeout=5)
        print("✅ Server is running!")
    except:
        print("❌ Server is not running. Please start the server first:")
        print("   cd chatbot-api")
        print("   uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        exit(1)
    
    test_api_format()

from crewai import Agent, LLM
from crewai_tools import TavilySearchResults
from dotenv import load_dotenv

# --- TOOL DEFINITION ---
# Define any tools your agents will use.
# For the trend spotter, we only need the search tool.
# Ensure TAVILY_API_KEY is set in your .env file.
search_tool = TavilySearchResults()
load_dotenv()

llm = LLM(
    llm = LLM(
    model="gemini/gemini-2.0-flash",
    temperature=0.7,
)
)
# --- AGENT DEFINITIONS ---
# Define each of your agents below.

trend_spotter = Agent(
    # The 'llm' parameter is now configured directly within the agent.
    # It will automatically use the GOOGLE_API_KEY from your .env file.
    # The model name 'gemini-1.5-flash' is a fast and powerful modern choice.
    llm=llm,
    role="Trend Spotter",
    goal="Identify emerging trends and hot topics for a specific subject.",
    backstory=(
        "You are an expert at scouring the internet for the latest news, "
        "discussions, and articles. You can quickly identify patterns "
        "and synthesize them into a concise list of trends."
    ),
    tools=[search_tool],
    verbose=True,
    allow_delegation=False
)

# --- HOW TO REPEAT FOR OTHER AGENTS ---
# This structure is now your template. To add the 'content_summarizer',
# you would simply add this code block below:
#
# content_summarizer = Agent(
#     llm="gemini-1.5-flash",
#     role="Content Summarizer",
#     goal="Summarize content in a concise and professional way without losing its essence.",
#     backstory=(
#         "You are an expert at summarizing content in a concise and professional manner. "
#         "You can take a large corpus of text and produce a shorter version that "
#         "captures the main idea."
#     ),
#     tools=[],  # This agent requires no external tools.
#     verbose=True,
#     allow_delegation=False
# )
#
# You would do the same for the 'post_editor' and 'chat_agent', making sure to
# pass the correct tools to each (e.g., the custom BlogSearchTool for the chat_agent).
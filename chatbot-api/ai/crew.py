from crewai import Agent, LLM, Crew, Task
from crewai_tools import TavilySearchTool
from dotenv import load_dotenv
import yaml
import os

# Import our custom tools
from ai.tools import get_blog_retrieval_tool

# Load environment variables
load_dotenv()

# --- TOOL DEFINITION ---
search_tool = TavilySearchTool()
blog_retrieval_tool = get_blog_retrieval_tool()

# Configure LLM
llm = LLM(
    model="gemini/gemini-2.0-flash",
    temperature=0.7,
)

# Load configuration files
def load_config():
    config_dir = os.path.join(os.path.dirname(__file__), 'config')
    
    with open(os.path.join(config_dir, 'agents.yaml'), 'r') as f:
        agents_config = yaml.safe_load(f)
    
    with open(os.path.join(config_dir, 'tasks.yaml'), 'r') as f:
        tasks_config = yaml.safe_load(f)
    
    return agents_config, tasks_config

# Load configurations
agents_config, tasks_config = load_config()

# --- AGENT DEFINITIONS ---
trend_spotter = Agent(
    llm=llm,
    role=agents_config['trend_spotter']['role'],
    goal=agents_config['trend_spotter']['goal'],
    backstory=agents_config['trend_spotter']['backstory'],
    tools=[search_tool],
    verbose=True,
    allow_delegation=False
)

content_summarizer = Agent(
    llm=llm,
    role=agents_config['content_summarizer']['role'],
    goal=agents_config['content_summarizer']['goal'],
    backstory=agents_config['content_summarizer']['backstory'],
    tools=[],
    verbose=True,
    allow_delegation=False
)

post_editor = Agent(
    llm=llm,
    role=agents_config['post_editor']['role'],
    goal=agents_config['post_editor']['goal'],
    backstory=agents_config['post_editor']['backstory'],
    tools=[],
    verbose=True,
    allow_delegation=False
)

chat_agent = Agent(
    llm=llm,
    role=agents_config['chat_agent']['role'],
    goal=agents_config['chat_agent']['goal'],
    backstory=agents_config['chat_agent']['backstory'],
    tools=[blog_retrieval_tool],  # Now has access to the knowledge base!
    verbose=True,
    allow_delegation=False
)

trend_based_writer = Agent(
    llm=llm,
    role=agents_config['trend_based_writer']['role'],
    goal=agents_config['trend_based_writer']['goal'],
    backstory=agents_config['trend_based_writer']['backstory'],
    tools=[search_tool],  # Has access to search tool for trend research
    verbose=True,
    allow_delegation=False
)

# --- TASK CREATION FUNCTIONS ---
def create_trend_discovery_task(topic: str, current_date: str):
    return Task(
        description=tasks_config['discover_trends']['description'].format(
            topic=topic,
            current_date=current_date
        ),
        expected_output=tasks_config['discover_trends']['expected_output'],
        agent=trend_spotter
    )

def create_content_summary_task(original_content: str, desired_length: str = "one paragraph"):
    return Task(
        description=tasks_config['summarize_content']['description'].format(
            original_content=original_content,
            desired_length=desired_length
        ),
        expected_output=tasks_config['summarize_content']['expected_output'],
        agent=content_summarizer
    )

def create_post_editing_task(draft_content: str, editing_goal: str):
    return Task(
        description=tasks_config['edit_post_draft']['description'].format(
            draft_content=draft_content,
            editing_goal=editing_goal
        ),
        expected_output=tasks_config['edit_post_draft']['expected_output'],
        agent=post_editor
    )

def create_blog_generation_task(topic: str, keywords: str, target_audience: str):
    return Task(
        description=tasks_config['generate_blog_draft']['description'].format(
            topic=topic,
            keywords=keywords,
            target_audience=target_audience
        ),
        expected_output=tasks_config['generate_blog_draft']['expected_output'],
        agent=post_editor
    )

def create_chat_task(chat_history: str, retrieved_context: str, user_question: str):
    return Task(
        description=tasks_config['answer_from_knowledge_base']['description'].format(
            chat_history=chat_history,
            retrieved_context=retrieved_context,
            user_question=user_question
        ),
        expected_output=tasks_config['answer_from_knowledge_base']['expected_output'],
        agent=chat_agent
    )

def create_trend_based_writing_task(trend_topic: str, target_audience: str = "general readers", post_length: str = "medium-length"):
    return Task(
        description=tasks_config['research_and_write_from_trend']['description'].format(
            trend_topic=trend_topic,
            target_audience=target_audience,
            post_length=post_length
        ),
        expected_output=tasks_config['research_and_write_from_trend']['expected_output'],
        agent=trend_based_writer
    )

# --- CREW EXECUTION FUNCTIONS ---
def execute_trend_discovery(topic: str):
    from datetime import datetime
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    task = create_trend_discovery_task(topic, current_date)
    crew = Crew(agents=[trend_spotter], tasks=[task])
    
    result = crew.kickoff()
    return result

def execute_content_summary(content: str, length: str = "one paragraph"):
    task = create_content_summary_task(content, length)
    crew = Crew(agents=[content_summarizer], tasks=[task])
    
    result = crew.kickoff()
    return result

def execute_post_editing(draft: str, goal: str):
    task = create_post_editing_task(draft, goal)
    crew = Crew(agents=[post_editor], tasks=[task])
    
    result = crew.kickoff()
    return result

def execute_blog_generation(topic: str, keywords: str, audience: str):
    task = create_blog_generation_task(topic, keywords, audience)
    crew = Crew(agents=[post_editor], tasks=[task])
    
    result = crew.kickoff()
    return result

def execute_chat_response(chat_history: str, retrieved_context: str, user_question: str):
    task = create_chat_task(chat_history, retrieved_context, user_question)
    crew = Crew(agents=[chat_agent], tasks=[task])
    
    result = crew.kickoff()
    return result

def execute_trend_based_writing(trend_topic: str, target_audience: str = "general readers", post_length: str = "medium-length"):
    """
    Execute trend-based blog post creation.
    
    Args:
        trend_topic: The trending topic or keyword to research and write about
        target_audience: The intended audience for the blog post
        post_length: Desired length of the post (short, medium-length, long)
    
    Returns:
        A complete blog post based on current trends
    """
    task = create_trend_based_writing_task(trend_topic, target_audience, post_length)
    crew = Crew(agents=[trend_based_writer], tasks=[task])
    
    result = crew.kickoff()
    return result
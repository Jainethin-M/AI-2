from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from geminiAIlist import list_gemini_models
from egfunctions import fan, light, TV
load_dotenv()

# Build once (important for web apps)
_model = ChatGoogleGenerativeAI(
    # model="gemini-flash-latest",  # working for you
    model="gemini-2.5-flash",
    temperature=0,
)

_tools = [list_gemini_models, light, fan, TV]
_agent_executor = create_react_agent(_model, _tools)


def get_ai_reply(user_input: str) -> str:
    """
    Takes a user message and returns the assistant reply as a single string.
    """
    user_input = (user_input or "").strip()
    if not user_input:
        return "Please type a message."

    parts = []
    for chunk in _agent_executor.stream({"messages": [HumanMessage(content=user_input)]}):
        if "agent" in chunk and "messages" in chunk["agent"]:
            for message in chunk["agent"]["messages"]:
                if message.content:
                    parts.append(message.content)

    return "".join(parts).strip() or "I couldn't generate a response."


def main():
    # Optional CLI mode for quick testing
    print("Welcome to the React Agent! Type 'exit' to quit Gemini.")
    print("I perform calculation for you.")

    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() == "exit":
            print("Goodbye!")
            break

        reply = get_ai_reply(user_input)
        print("\nAssistant:", reply)


if __name__ == "__main__":
    main()

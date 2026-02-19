import json

def update_3d_model(parameters: dict):
    """
    Generates a JSON payload to update the 3D model.
    """
    return {
        "function_call": "update_simulation",
        "parameters": parameters,
        "explanation": "Updating 3D model with provided parameters."
    }

def search_theory(query: str):
    """
    Placeholder for theory search. In a real scenario, this might query a specific database or the RAG engine directly if configured as a tool.
    For now, the RAG engine is used primarily for text generation, but this tool can be used to signal the frontend or logging.
    """
    return {
        "function_call": "search_theory",
        "parameters": {"query": query},
        "explanation": f"Searching theory for: {query}"
    }

AVAILABLE_TOOLS = {
    "update_3d_model": update_3d_model,
    "search_theory": search_theory
}

def get_tool_definitions():
    """
    Returns the tool definitions for the LLM (e.g., OpenAI function calling format).
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "update_3d_model",
                "description": "Control and update the 3D physics simulation model (e.g., Cyclotron, Loudspeaker).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "model_name": {
                            "type": "string",
                            "enum": ["cyclotron", "loudspeaker"],
                            "description": "The name of the 3D model to control."
                        },
                        "parameters": {
                            "type": "object",
                            "description": "Key-value pairs of parameters to update (e.g., speed, voltage, frequency)."
                        }
                    },
                    "required": ["model_name", "parameters"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_theory",
                "description": "Search for theoretical physics concepts when the user asks a theory question.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query for the theory."
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    ]

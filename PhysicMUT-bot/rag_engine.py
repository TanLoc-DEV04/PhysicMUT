import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
# from langchain_openai import OpenAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
import shutil

# Define paths
DATA_DIR = "./data"
CHROMA_PATH = "./chroma_sgk_db"

def load_pdf(file_path: str):
    """Loads a PDF file and returns a list of documents."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    loader = PyMuPDFLoader(file_path)
    documents = loader.load()
    return documents

def chunk_text(documents):
    """Chunks documents into smaller pieces."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(documents)
    return chunks

def get_vectorstore():
    """Returns the ChromaDB vector store."""
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embedding_function
    )
    return vectorstore

def create_vectorstore(file_path: str):
    """Creates a new vector store from a PDF file."""
    # Clear existing DB if needed (optional, for development)
    # if os.path.exists(CHROMA_PATH):
    #     shutil.rmtree(CHROMA_PATH)

    documents = load_pdf(file_path)
    chunks = chunk_text(documents)
    
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_function,
        persist_directory=CHROMA_PATH
    )
    return vectorstore

def query_rag(query: str, k: int = 4):
    """Queries the RAG engine for relevant context."""
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(query, k=k)
    return results

def get_design_vectorstore():
    """Returns the ChromaDB vector store for design and pedagogical guidelines."""
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Chroma(
        persist_directory="./chroma_design_db",
        embedding_function=embedding_function
    )
    return vectorstore

def query_design_rag(query: str, k: int = 2):
    """Queries the specific design/pedagogy RAG engine for presentation guidelines."""
    vectorstore = get_design_vectorstore()
    results = vectorstore.similarity_search(query, k=k)
    return results

if __name__ == "__main__":
    # Test RAG
    # Create a dummy PDF for testing if it doesn't exist
    test_pdf = "test_physics.pdf"
    if not os.path.exists(test_pdf):
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Physics 12: Cyclotrons use magnetic fields to accelerate charged particles.", ln=1, align="C")
        pdf.cell(200, 10, txt="The radius of the path is given by r = mv / qB.", ln=2, align="C")
        pdf.output(test_pdf)
        print(f"Created {test_pdf} for testing.")
        create_vectorstore(test_pdf)

    results = query_rag("What is a cyclotron?")
    for doc in results:
        print(doc.page_content)

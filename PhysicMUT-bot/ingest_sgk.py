import os
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

# Ensure environment variables (like OPENAI_API_KEY) are loaded
load_dotenv()

from langchain_community.document_loaders import TextLoader

# Define paths
DATA_DIR = "./FILE/SGK-VAT LY-TEXT"
CHROMA_PATH = "./chroma_sgk_db"

def load_and_chunk_text(file_path: str, filename: str):
    print(f"Loading text from {filename}...")
    loader = TextLoader(file_path, encoding='utf-8')
    documents = loader.load()
    
    # We use a RecursiveCharacterTextSplitter but with slightly larger chunks to keep context
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200,
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    
    # Inject metadata
    for chunk in chunks:
        # We explicitly add 'book' to be used nicely
        # Remove '.txt' to just get the book name
        book_name = filename.replace(".txt", "")
        chunk.metadata['book'] = book_name
        
    print(f"-> Created {len(chunks)} chunks from {filename}")
    return chunks

def create_vectorstore():
    # Gather all Text files in the directory
    all_chunks = []
    
    if not os.path.exists(DATA_DIR):
        print(f"Directory {DATA_DIR} not found. Vui lòng chạy OCR script trước.")
        return
        
    for filename in os.listdir(DATA_DIR):
        if filename.lower().endswith(".txt"):
            file_path = os.path.join(DATA_DIR, filename)
            chunks = load_and_chunk_text(file_path, filename)
            all_chunks.extend(chunks)
            
    if not all_chunks:
        print("No TEXT files found to ingest. Vui lòng chạy OCR script trước để sinh ra file text.")
        return

    print(f"Total chunks to embed: {len(all_chunks)}")
    print("Initializing OpenAI Embeddings and creating ChromaDB. This might take a few minutes...")
    
    try:
        embedding_function = OpenAIEmbeddings(model="text-embedding-3-small")
        
        # We create the vectorstore from the chunks
        Chroma.from_documents(
            documents=all_chunks,
            embedding=embedding_function,
            persist_directory=CHROMA_PATH
        )
        print(f"Successfully created vectorstore at {CHROMA_PATH}!")
    except Exception as e:
        print(f"Failed to create vectorstore: {e}")

if __name__ == "__main__":
    create_vectorstore()

import os
import glob
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv

load_dotenv()

# Define the target folders relative to the bot root
FOLDERS = [
    os.path.join("FILE", "DESIGN"),
    os.path.join("FILE", "QUIZZ-SUPPORT"),
    os.path.join("FILE", "SLIDE-SUPPORT")
]

DB_PATH = "chroma_design_db"

def ingest_design_documents():
    print("Starting ingestion for design support documents...")
    all_chunks = []
    
    # Initialize text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=300,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    # Process each PDF in the folders
    for folder in FOLDERS:
        print(f"\nScanning folder: {folder}")
        pdf_files = glob.glob(os.path.join(folder, "*.pdf"))
        
        if not pdf_files:
            print(f"Warning: No PDF files found in {folder}")
            
        for pdf_path in pdf_files:
            print(f"  Loading {pdf_path}...")
            try:
                loader = PyMuPDFLoader(pdf_path)
                docs = loader.load()
                
                # Add enhanced metadata identifying the book type
                folder_type = os.path.basename(folder)
                for doc in docs:
                    doc.metadata["document_type"] = folder_type
                    doc.metadata["source_book"] = os.path.basename(pdf_path)
                
                chunks = text_splitter.split_documents(docs)
                all_chunks.extend(chunks)
                print(f"    -> Extracted {len(chunks)} chunks.")
            except Exception as e:
                print(f"    -> Error loading {pdf_path}: {e}")

    if not all_chunks:
        print("\n[ERROR] No documents were processed. Exiting.")
        return

    print(f"\nTotal chunks to embed: {len(all_chunks)}")
    
    # Initialize embeddings matching the core knowledge DB
    embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("\nBuilding Chroma DB...")
    print("Please wait. This process will upload and index all chunks to OpenAI which may take several minutes.")
    
    vectorstore = Chroma.from_documents(
        documents=all_chunks,
        embedding=embedding_function,
        persist_directory=DB_PATH
    )
    
    print(f"\n[SUCCESS] Document ingestion complete. Created database at '{DB_PATH}' with {len(all_chunks)} chunks.")

if __name__ == "__main__":
    ingest_design_documents()

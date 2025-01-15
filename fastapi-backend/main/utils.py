import os
import cohere
from collections import defaultdict
from datasets import Dataset
from dotenv import load_dotenv
import fitz  # PyMuPDF
import pandas as pd
from transformers import RobertaTokenizer
import torch


def pdf_to_text(pdf_path):
    try:
        # Open the PDF document
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error processing file {pdf_path}: {e}")
        return None


def write_files(input_dir, output_path):
    # Check if the input directory exists
    if not os.path.isdir(input_dir):
        print(f"Input directory '{input_dir}' does not exist.")
        return

    # Ensure the output directory exists
    os.makedirs(output_path, exist_ok=True)

    for file in os.listdir(input_dir):
        input_file = os.path.join(input_dir, file)
        if os.path.isdir(input_file):
            print(f"skipping directory: {format(input_file)}")
            continue  # Skip directories

        pdf_text = pdf_to_text(input_file)
        if pdf_text is None:
            continue  # Skip if the PDF could not be read

        output_file = os.path.join(output_path, f"{os.path.splitext(file)[0]}.txt")
        with open(output_file, "w") as f:
            f.write(pdf_text)


def get_cohere_api_key():
    """
    Retrieves the Cohere API key from an environment variable.
    """
    api_key = os.getenv("COHERE_API_KEY")
    if not api_key:
        raise EnvironmentError("COHERE_API_KEY environment variable not set.")
    return api_key


def process_syllabus(file_path):
    """
    Reads the syllabus text from the given file path.
    """
    with open(file_path, "r") as file:
        syllabus_text = file.read()
    return syllabus_text


def extract_info(document_text, cohere_client):
    """
    Extracts tasks, task percentages, descriptions, and deadlines from the provided document text.
    """
    prompt = f"""
    Extract all tasks, task percentages, descriptions, and deadlines from the following document. 
    If any information (like description or deadline or task percentage) is missing, 
    write 'N/A' in that cell. Also, include any milestones or deliverables that are part of each task.
    Document: 
    {document_text}
    Format the output as follows:
    | Task | Task Percentage | Description | Deadline |
    | --- | --- | --- | --- |
    | <Task Name> | <Task Percentage> | <Description> | <Deadline> |
    """
    # Call the Cohere API to generate text
    response = cohere_client.generate(
        model="command-xlarge-nightly", prompt=prompt, max_tokens=1500, temperature=0.7
    )

    # Extract and return the generated response text
    return response.generations[0].text


def extract_tasks(input_folder, output_folder, input_filename):
    # Get API key securely from environment variables
    load_dotenv()
    api_key = get_cohere_api_key()
    cohere_client = cohere.Client(api_key)

    # Create output folder if it does not exist
    os.makedirs(output_folder, exist_ok=True)

    # Process each file in the input folder
    for filename in os.listdir(input_folder):
        if filename != input_filename:
            continue

        input_filepath = os.path.join(input_folder, filename)
        document_text = process_syllabus(input_filepath)

        output_text = extract_info(document_text, cohere_client)

        # Write the extracted information to an output file
        output_filepath = os.path.join(
            output_folder, f"{os.path.splitext(filename)[0]}_results.txt"
        )
        with open(output_filepath, "w") as result_file:
            result_file.write(output_text)


def extract_tasks_from_file(file_path, delimiter="|", save_path=None):
    """Extract tasks from a text or CSV file."""
    data = pd.read_csv(file_path, delimiter=delimiter)
    data.columns = data.columns.str.strip()  # Clean up column names
    data = data.applymap(lambda x: x.strip() if isinstance(x, str) else x)  # Clean data
    # Remove rows where the 'Task' column contains '---'
    data = data[data["Task"] != "---"]
    task_column = data["Task"]

    if save_path:
        task_column.to_csv(save_path, index=False, header=True)
        print(f"Cleaned task column saved to '{save_path}'.")

    return task_column.tolist()


def tokenize_function(examples):
    """Tokenize the text column."""
    tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
    return tokenizer(examples["tasks"], padding="max_length", truncation=True)


def classify_tasks(data_path, tasks, model):
    """Classify tasks using the trained RoBERTa model."""
    model.eval()
    tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    inputs = tokenizer(
        tasks, padding=True, truncation=True, max_length=128, return_tensors="pt"
    )
    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.argmax(outputs.logits, dim=-1)

    df = pd.read_csv(data_path)
    df = df.drop(
        columns=["Unnamed: 0"], errors="ignore"
    )  # remove the first unnamed column
    df = df.drop(0).reset_index(drop=True)  # remove first row
    df.columns = ["pdf", "tasks", "class"]
    df["pdf"] = df["pdf"].fillna(method="ffill")

    dataset = Dataset.from_pandas(df)
    dataset = dataset.class_encode_column("class")

    class_labels = dataset.features["class"].names
    predicted_labels = [class_labels[pred] for pred in predictions]

    return predicted_labels

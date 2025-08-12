import pandas as pd
from typing import List, Dict, Any
import re

class DataProcessor:
    def __init__(self):
        self.training_data = []
        
    def add_text_pair(self, technical: str, natural: str, source: str = None):
        """Add a pair of technical and natural text to training data"""
        self.training_data.append({
            'technical': technical,
            'natural': natural,
            'source': source
        })
        
    def preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing that preserves exact formatting"""
        # Split into paragraphs
        paragraphs = text.split('\n\n')
        processed_paragraphs = []
        
        for paragraph in paragraphs:
            if not paragraph.strip():
                continue
                
            # Process each line in paragraph
            lines = paragraph.split('\n')
            processed_lines = []
            
            for line in lines:
                # Preserve exact indentation
                indent = len(line) - len(line.lstrip())
                content = line[indent:]
                
                # Clean content
                content = re.sub(r'http\S+|www.\S+', '', content)  # Remove URLs
                content = re.sub(r'(?<= ) +', ' ', content)  # Normalize internal spaces
                content = content.rstrip()  # Remove trailing spaces but keep leading indent
                
                # Reconstruct line with original indentation
                processed_line = ' ' * indent + content
                processed_lines.append(processed_line)
            
            # Rejoin paragraph lines
            processed_paragraph = '\n'.join(processed_lines)
            if processed_paragraph.strip():
                processed_paragraphs.append(processed_paragraph)
        
        # Rejoin paragraphs with consistent spacing
        return '\n\n'.join(processed_paragraphs)
        
    def get_training_pairs(self) -> List[Dict[str, Any]]:
        """Return processed training pairs"""
        processed_pairs = []
        for pair in self.training_data:
            processed_pairs.append({
                'technical': self.preprocess_text(pair['technical']),
                'natural': self.preprocess_text(pair['natural']),
                'source': pair['source']
            })
        return processed_pairs
    
    def save_to_csv(self, filepath: str):
        """Save training data to CSV"""
        df = pd.DataFrame(self.get_training_pairs())
        df.to_csv(filepath, index=False)
    
    def load_from_csv(self, filepath: str):
        """Load training data from CSV"""
        df = pd.DataFrame.read_csv(filepath)
        self.training_data = df.to_dict('records') 
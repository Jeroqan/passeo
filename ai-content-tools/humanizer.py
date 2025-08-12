from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import List, Dict, Any
import re
import json
import os
from functools import lru_cache

class TextHumanizer:
    _instance = None
    _is_initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TextHumanizer, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._is_initialized:
            self.cache_file = "humanizer_cache.json"
            self.load_cache()
            self.model_name = "facebook/bart-large"
            self._is_initialized = True
            # Model yüklemesini lazy loading ile yap
            self._tokenizer = None
            self._model = None
            self._device = None
            
    @property
    def tokenizer(self):
        if self._tokenizer is None:
            self._tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                local_files_only=True,  # Önce lokalde ara
                cache_dir="./model_cache"  # Cache dizini
            )
        return self._tokenizer
        
    @property
    def model(self):
        if self._model is None:
            self._model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_name,
                local_files_only=True,  # Önce lokalde ara
                cache_dir="./model_cache"  # Cache dizini
            )
            self._model.to(self.device)
            # Modeli optimize et
            self._model.eval()  # Eval moduna al
            torch.set_grad_enabled(False)  # Gradyanları devre dışı bırak
        return self._model
        
    @property
    def device(self):
        if self._device is None:
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
        return self._device

    def load_cache(self):
        """Cache'i yükle"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.cache = json.load(f)
            else:
                self.cache = {}
        except:
            self.cache = {}
            
    def save_cache(self):
        """Cache'i kaydet"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except:
            pass

    def split_paragraphs(self, text: str) -> List[Dict[str, Any]]:
        """Metni paragraflara böl ve formatı koru"""
        paragraphs = []
        current_lines = []
        
        for line in text.split('\n'):
            if line.strip():
                current_lines.append(line)
            elif current_lines:
                para = {
                    'text': '\n'.join(current_lines),
                    'indent': [len(l) - len(l.lstrip()) for l in current_lines],
                    'original': '\n'.join(current_lines)
                }
                paragraphs.append(para)
                current_lines = []
                
        if current_lines:
            para = {
                'text': '\n'.join(current_lines),
                'indent': [len(l) - len(l.lstrip()) for l in current_lines],
                'original': '\n'.join(current_lines)
            }
            paragraphs.append(para)
            
        return paragraphs

    def restore_format(self, original: str, new_text: str) -> str:
        """Orijinal formatı yeni metne uygula"""
        orig_lines = original.split('\n')
        new_lines = new_text.split('\n')
        result = []
        
        for i, new_line in enumerate(new_lines):
            if i < len(orig_lines):
                indent = len(orig_lines[i]) - len(orig_lines[i].lstrip())
                result.append(' ' * indent + new_line.strip())
            else:
                result.append(new_line)
                
        return '\n'.join(result)

    def humanize(self, text: str, ai_scores: Dict[str, float]) -> Dict[str, Any]:
        """Metni doğallaştır ve formatı koru"""
        paragraphs = self.split_paragraphs(text)
        result_parts = []
        highlights = []
        updated_scores = {}
        
        for i, para in enumerate(paragraphs):
            para_id = f"p{i}"
            score = ai_scores.get(para_id, 0)
            cache_key = para['text']
            
            # Cache'den kontrol et
            if cache_key in self.cache and score <= 0.3:
                result_parts.append(self.cache[cache_key])
                highlights.append(False)
                updated_scores[para_id] = score
                continue
                
            # Yüksek AI skoru varsa işle
            if score > 0.3:
                try:
                    inputs = self.tokenizer(
                        para['text'],
                        return_tensors="pt",
                        max_length=512,
                        truncation=True
                    ).to(self.device)
                    
                    outputs = self.model.generate(
                        **inputs,
                        num_return_sequences=1,
                        max_length=512,
                        min_length=len(para['text'].split()) // 2,
                        temperature=0.7,
                        top_p=0.9,
                        repetition_penalty=2.5,
                        no_repeat_ngram_size=3,
                        do_sample=True
                    )
                    
                    decoded = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                    formatted = self.restore_format(para['original'], decoded)
                    
                    # Cache'e kaydet
                    self.cache[cache_key] = formatted
                    
                    result_parts.append(formatted)
                    highlights.append(True)
                    updated_scores[para_id] = 0
                except Exception as e:
                    print(f"Error processing paragraph {i}: {str(e)}")
                    result_parts.append(para['original'])
                    highlights.append(False)
                    updated_scores[para_id] = score
            else:
                result_parts.append(para['original'])
                highlights.append(False)
                updated_scores[para_id] = score
        
        # Cache'i kaydet
        self.save_cache()
        
        return {
            'text': '\n\n'.join(result_parts).strip(),
            'highlights': highlights,
            'scores': updated_scores
        }
    
    def fine_tune(self, train_pairs: List[Dict], epochs: int = 3):
        """Fine-tune the model on training pairs"""
        # Prepare training data
        train_texts = [pair['technical'] for pair in train_pairs]
        train_labels = [pair['natural'] for pair in train_pairs]
        
        # Tokenize data
        train_encodings = self.tokenizer(
            train_texts,
            truncation=True,
            padding=True,
            return_tensors="pt"
        )
        
        label_encodings = self.tokenizer(
            train_labels,
            truncation=True,
            padding=True,
            return_tensors="pt"
        )
        
        # Training loop
        self.model.train()
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=2e-5)
        
        for epoch in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(
                input_ids=train_encodings['input_ids'],
                attention_mask=train_encodings['attention_mask'],
                labels=label_encodings['input_ids']
            )
            
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            
            print(f"Epoch {epoch+1}/{epochs}, Loss: {loss.item():.4f}")
            
        self.model.eval() 
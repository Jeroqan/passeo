from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Global variables for models
app = Flask(__name__)
CORS(app)
device = None
hf_tokenizer_tr = None
hf_model_tr = None
embedding_model = None

# AI-generated text patterns for Turkish (embedding references)
AI_REFERENCE_TEXTS = [
    "Bu ürün gelişmiş teknoloji kullanarak tasarlanmıştır ve kullanıcılara mükemmel performans sunmaktadır.",
    "Ürünün yenilikçi özellikleri sayesinde kullanıcı deneyimi önemli ölçüde geliştirilmiştir.",
    "Bu teknolojik çözüm, modern kullanıcıların ihtiyaçlarını karşılamak için özel olarak geliştirilmiştir.",
    "Profesyonel kalitede tasarım ve üstün performans bir arada sunulmuştur.",
    "Bu ürün, sektördeki en son teknolojik gelişmeleri kullanarak üretilmiştir.",
    "Kullanıcı dostu arayüz ve gelişmiş özellikler sayesinde maksimum verimlilik sağlanır.",
    "Bu innovative çözüm, hem performans hem de kalite açısından üstün standartlara sahiptir.",
    "Teknolojik altyapı ve modern tasarım anlayışı ile geliştirilmiş bu ürün...",
    "Bu bağlamda, ürünün sunduğu özellikler kullanıcı deneyimini optimize etmektedir.",
    "Gelişmiş algoritma ve yenilikçi yaklaşım ile tasarlanan bu sistem..."
]

# Human-written text patterns for Turkish (embedding references) 
HUMAN_REFERENCE_TEXTS = [
    "Bu ürünü aldım ve gerçekten memnun kaldım. Tavsiye ederim.",
    "Fiyatına göre iyi bir ürün. Kalitesi beklediğimden daha iyi çıktı.",
    "Sipariş verdiğim ürün hızlıca geldi. Paketleme de güzeldi.",
    "Bu markayı ilk defa deniyorum ama beğendim.",
    "Ürün açıklamasında yazanlarla birebir aynı. Hiç sorun yaşamadım.",
    "Daha önce başka marka kullanıyordum ama bunu tercih ediyorum artık.",
    "Arkadaşımın tavsiyesi üzerine aldım. İyi ki almışım.",
    "Kargo çok hızlıydı. Ürün de tam istediğim gibiydi.",
    "Bu fiyata bu kaliteyi bulmak zor. Güzel bir alışveriş oldu.",
    "İkinci defa aynı üründen alıyorum. Çok memnunum."
]

def load_models():
    global device, hf_tokenizer_tr, hf_model_tr, embedding_model
    if torch.cuda.is_available():
        device = torch.device("cuda")
        logging.info(f"✅ CUDA (GPU) is available. Using device: {torch.cuda.get_device_name(0)}")
    else:
        device = torch.device("cpu")
        logging.info("⚠️ CUDA (GPU) not found. Falling back to CPU.")

    logging.info("Loading models...")
    
    # Load Turkish GPT2 model (existing)
    model_name_tr = "ytu-ce-cosmos/turkish-gpt2-large"
    try:
        logging.info(f"Loading Turkish HuggingFace model: {model_name_tr}...")
        hf_tokenizer_tr = GPT2Tokenizer.from_pretrained(model_name_tr)
        hf_model_tr = GPT2LMHeadModel.from_pretrained(model_name_tr).to(device)
        hf_model_tr.eval()
        logging.info(f"✅ Turkish GPT2 model loaded successfully.")
    except OSError as e:
        logging.error(f"❌ Critical error loading model '{model_name_tr}'. Error: {e}")
        
    # Load Sentence Transformer for embeddings
    try:
        logging.info("Loading SentenceTransformer model for embeddings...")
        embedding_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        logging.info("✅ Embedding model loaded successfully.")
    except Exception as e:
        logging.error(f"❌ Error loading embedding model: {e}")
        
    logging.info(f"✅ All models loaded successfully on {device}.")

def embedding_based_ai_detection(text, threshold=0.75):
    """
    Embedding + Kosinüs benzerliği tabanlı AI detection
    """
    if not embedding_model:
        return {"error": "Embedding model not loaded"}, 500
        
    try:
        # Input text'i embedding'e çevir
        input_embedding = embedding_model.encode([text])
        
        # AI reference texts'lerin embedding'leri
        ai_embeddings = embedding_model.encode(AI_REFERENCE_TEXTS)
        
        # Human reference texts'lerin embedding'leri  
        human_embeddings = embedding_model.encode(HUMAN_REFERENCE_TEXTS)
        
        # Kosinüs benzerliği hesapla
        ai_similarities = cosine_similarity(input_embedding, ai_embeddings)[0]
        human_similarities = cosine_similarity(input_embedding, human_embeddings)[0]
        
        # En yüksek benzerlik skorları
        max_ai_similarity = float(np.max(ai_similarities))
        max_human_similarity = float(np.max(human_similarities))
        avg_ai_similarity = float(np.mean(ai_similarities))
        avg_human_similarity = float(np.mean(human_similarities))
        
        # AI probability hesapla
        ai_score = max_ai_similarity / (max_ai_similarity + max_human_similarity)
        
        logging.info(f"🔍 Embedding AI Detection:")
        logging.info(f"   Max AI similarity: {max_ai_similarity:.3f}")
        logging.info(f"   Max Human similarity: {max_human_similarity:.3f}")
        logging.info(f"   AI Score: {ai_score:.3f}")
        
        return {
            "ai_probability": round(ai_score, 4),
            "max_ai_similarity": round(max_ai_similarity, 4),
            "max_human_similarity": round(max_human_similarity, 4),
            "avg_ai_similarity": round(avg_ai_similarity, 4),
            "avg_human_similarity": round(avg_human_similarity, 4),
            "is_ai": ai_score > threshold,
            "confidence": round(abs(ai_score - 0.5) * 2, 4)  # 0-1 arasında confidence
        }
        
    except Exception as e:
        logging.error(f"❌ Embedding detection error: {e}")
        return {"error": str(e)}, 500

def paragraph_level_embedding_detection(text, threshold=0.65):
    """
    Paragraf bazında embedding detection
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if not paragraphs:
        paragraphs = [text]
    
    results = []
    scores = []
    
    for paragraph in paragraphs:
        if len(paragraph.strip()) < 20:  # Çok kısa paragrafları atla
            continue
            
        result = embedding_based_ai_detection(paragraph, threshold)
        if "error" not in result:
            results.append({
                "paragraph": paragraph,  # Kısaltma yapmayalım, tam metni gönderelim
                "ai_probability": result["ai_probability"],
                "is_ai": result["is_ai"],
                "confidence": result["confidence"]
            })
            scores.append(result["ai_probability"])
    
    # Overall AI probability
    overall_ai_probability = float(np.mean(scores)) if scores else 0.0
    
    return {
        "overall_ai_probability": round(overall_ai_probability, 4),
        "paragraphs": [r["paragraph"] for r in results],
        "scores": [r["ai_probability"] for r in results],
        "detailed_results": results
    }

def custom_sentence_tokenizer(text):
    # This regex handles various sentence endings and keeps them with the sentence.
    matches = re.finditer(r'[^.!?\s][^.!?]*(?:[.!?](?![\'"]?\s|$)[^.!?]*)*[.!?]?[\'"]?(?=\s|$)', text)
    return [match.group(0).strip() for match in matches]

def sentence_level_detection(text, model, hf_tokenizer, device, threshold=50.0):
    lines = text.splitlines()
    
    # Find the first non-empty line as the title
    title = ""
    first_paragraph_index = 0
    for i, line in enumerate(lines):
        if line.strip():
            title = line.strip()
            first_paragraph_index = i + 1
            break
            
    paragraphs = lines[first_paragraph_index:]
    results = []
    all_scores = []

    for paragraph in paragraphs:
        if not paragraph.strip():
            # Keep empty lines between paragraphs for structure
            results.append({'paragraph': [{'text': '', 'is_ai': False, 'confidence': 0}]})
            continue
        
        sentences = custom_sentence_tokenizer(paragraph)
        paragraph_result = []
        
        for sentence in sentences:
            if not sentence.strip():
                continue
            
            inputs = hf_tokenizer(sentence, return_tensors="pt").to(device)
            with torch.no_grad():
                outputs = model(**inputs, labels=inputs["input_ids"])
                loss = outputs.loss
                perplexity = torch.exp(loss).item()

            score = min(perplexity, 100.0)
            all_scores.append(score)
            
            paragraph_result.append({
                'text': sentence,
                'is_ai': bool(score > threshold),
                'confidence': round(score, 2)
            })
        results.append({'paragraph': paragraph_result})

    overall_score = np.mean(all_scores) if all_scores else 0
    return {'title': title, 'results': results, 'overall_score': round(overall_score, 2)}

@app.route('/api/detect', methods=['POST'])
def detect():
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    response = sentence_level_detection(text, hf_model_tr, hf_tokenizer_tr, device)
    return jsonify(response)

@app.route('/api/embedding-detect', methods=['POST'])
def embedding_detect():
    """
    Embedding + Kosinüs benzerliği tabanlı AI detection endpoint
    """
    data = request.get_json()
    text = data.get('text')
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    # Paragraf bazında embedding detection
    response = paragraph_level_embedding_detection(text)
    return jsonify(response)

@app.route('/api/health', methods=['GET'])
def health():
    """
    Servis durumunu kontrol et
    """
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'gpt2_turkish': hf_model_tr is not None,
            'embedding_model': embedding_model is not None
        }
    })

if __name__ == '__main__':
    load_models()
    app.run(host='0.0.0.0', port=5001, debug=True) 
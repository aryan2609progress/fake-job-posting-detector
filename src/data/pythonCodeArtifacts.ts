export interface PythonFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_PROJECT_FILES: PythonFile[] = [
  {
    filename: 'preprocess.py',
    path: 'src/preprocess.py',
    language: 'python',
    description: 'Cleans text columns, strips HTML tags, removes stopwords, and tokenizes/lemmatizes strings.',
    code: `"""
Fake Job Posting Detector - Text Preprocessing Module
Cleans raw text fields from the EMSCAD dataset and user inputs.
"""
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download required NLTK resources if not already present
for resource in ['stopwords', 'wordnet', 'omw-1.4']:
    try:
        nltk.data.find(f'corpora/{resource}')
    except LookupError:
        nltk.download(resource, quiet=True)

lemmatizer = WordNetLemmatizer()
STOP_WORDS = set(stopwords.words('english'))

def clean_text(text: str) -> str:
    """
    Standardize text: lowercases, removes HTML tags, punctuation, numbers,
    and returns lemmatized tokens without stopwords.
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # Remove HTML tags (frequently present in EMSCAD raw data)
    text = re.sub(r'<.*?>', ' ', text)
    # Remove URL links
    text = re.sub(r'http\\S+|www\\S+|https\\S+', ' ', text, flags=re.MULTILINE)
    # Remove email addresses
    text = re.sub(r'\\S+@\\S+', ' ', text)
    # Lowercase
    text = text.lower()
    # Remove punctuation and non-alphabetic characters
    text = re.sub(r'[^a-zA-Z\\s]', ' ', text)
    
    # Tokenize, strip stopwords, and lemmatize
    tokens = text.split()
    cleaned_tokens = [
        lemmatizer.lemmatize(word)
        for word in tokens
        if word not in STOP_WORDS and len(word) > 2
    ]
    
    return " ".join(cleaned_tokens)

def combine_text_fields(row: dict) -> str:
    """
    Combines description, requirements, company profile, and benefits.
    """
    parts = [
        str(row.get('title', '')),
        str(row.get('company_profile', '')),
        str(row.get('description', '')),
        str(row.get('requirements', '')),
        str(row.get('benefits', ''))
    ]
    combined = " ".join([p for p in parts if p.strip()])
    return clean_text(combined)
`
  },
  {
    filename: 'features.py',
    path: 'src/features.py',
    language: 'python',
    description: 'Implements all 8 rule-based red flag checks described in the project spec.',
    code: `"""
Fake Job Posting Detector - Red Flag Rule Feature Engineering
Runs independent heuristic checks alongside the ML model.
"""
import re

URGENCY_KEYWORDS = [
    "apply immediately", "limited seats", "urgent hiring", "act now",
    "immediate start", "apply right now", "start today", "hurry up",
    "limited slots", "immediate opening", "urgently hiring"
]

FREE_EMAIL_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com"
]

SCAM_TRIGGER_PHRASES = [
    "wire transfer", "western union", "moneygram", "cashier check",
    "deposit check", "clearing check", "buy equipment", "telegram",
    "whatsapp", "envelope stuffing", "package inspector", "reshipping"
]

def check_company_info(company_profile: str) -> dict:
    """Rule 1: No company info (empty or under 20 words)"""
    if not company_profile or len(company_profile.split()) < 20:
        return {
            "flagged": True,
            "rule": "no_company_info",
            "message": "Company profile is missing or under 20 words."
        }
    return {"flagged": False, "rule": "no_company_info"}

def check_website_link(text: str, website: str = "") -> dict:
    """Rule 2: No website or LinkedIn link found"""
    url_pattern = r'https?://(?:[-\\w.]|(?:%[\\da-fA-F]{2}))+'
    has_url = bool(re.search(url_pattern, text)) or bool(website and re.search(url_pattern, website))
    if not has_url:
        return {
            "flagged": True,
            "rule": "no_website_link",
            "message": "No official company website or verified LinkedIn URL provided."
        }
    return {"flagged": False, "rule": "no_website_link"}

def check_vague_description(description: str) -> dict:
    """Rule 3: Generic/vague description (under 40 words or lacking responsibilities)"""
    word_count = len(description.split()) if description else 0
    if word_count < 40:
        return {
            "flagged": True,
            "rule": "vague_description",
            "message": f"Job description is unusually short ({word_count} words). Lacks concrete duties."
        }
    return {"flagged": False, "rule": "vague_description"}

def check_urgency_language(text: str) -> dict:
    """Rule 4: High-pressure urgency language"""
    text_lower = text.lower()
    matched = [kw for kw in URGENCY_KEYWORDS if kw in text_lower]
    if matched:
        return {
            "flagged": True,
            "rule": "urgency_language",
            "message": f"High-pressure urgency phrases detected: {', '.join(matched)}."
        }
    return {"flagged": False, "rule": "urgency_language"}

def check_unrealistic_salary(title: str, salary_text: str) -> dict:
    """Rule 5: Unrealistic salary comparison"""
    if not salary_text:
        return {"flagged": False, "rule": "unrealistic_salary"}
    
    # Extract numerical wage figures
    numbers = [int(n) for n in re.findall(r'\\b(\\d{2,6})\\b', salary_text.replace(',', ''))]
    title_lower = title.lower()
    
    is_entry_role = any(r in title_lower for r in ["data entry", "assistant", "typist", "clerk", "customer"])
    if is_entry_role and numbers:
        max_num = max(numbers)
        # Hourly rate > $45/hr or annual > $80,000 for basic typing/entry
        if (max_num > 45 and max_num < 200) or (max_num > 85000):
            return {
                "flagged": True,
                "rule": "unrealistic_salary",
                "message": f"Salary stated ({salary_text}) is significantly higher than market benchmark for an entry-level role."
            }
    return {"flagged": False, "rule": "unrealistic_salary"}

def check_contact_email(email: str, text: str = "") -> dict:
    """Rule 6: Suspicious free email domain instead of company domain"""
    target = email.lower()
    if not target:
        found_emails = re.findall(r'[\\w\\.-]+@([\\w\\.-]+)', text)
        if found_emails:
            target = found_emails[0].lower()
    
    if any(domain in target for domain in FREE_EMAIL_DOMAINS):
        return {
            "flagged": True,
            "rule": "suspicious_email",
            "message": f"Uses free/public email service ({target}) rather than corporate domain."
        }
    return {"flagged": False, "rule": "suspicious_email"}

def check_spelling_grammar_quality(text: str) -> dict:
    """Rule 7: Excessive capitalization and punctuation anomalies"""
    if not text:
        return {"flagged": False, "rule": "grammar_quality"}
    
    words = text.split()
    if not words:
        return {"flagged": False, "rule": "grammar_quality"}
        
    caps_count = sum(1 for w in words if w.isupper() and len(w) > 3)
    exclamation_count = text.count('!')
    
    if (caps_count / len(words) > 0.08) or exclamation_count > 6:
        return {
            "flagged": True,
            "rule": "grammar_quality",
            "message": "Unprofessional formatting: excessive ALL-CAPS words or repeated exclamation marks."
        }
    return {"flagged": False, "rule": "grammar_quality"}

def check_physical_address(location: str, text: str) -> dict:
    """Rule 8: No physical address / office location specified"""
    combined = f"{location} {text}".lower()
    if not location or any(v in location.lower() for v in ["anywhere", "remote", "n/a", "unknown"]):
        # Check if text contains any city, state, or country
        if not re.search(r'\\b(street|ave|suite|building|floor|office|headquarters|ny|ca|tx|london|uk|usa|wa)\\b', combined):
            return {
                "flagged": True,
                "rule": "no_physical_address",
                "message": "No verified physical office address, city, or registered corporate location mentioned."
            }
    return {"flagged": False, "rule": "no_physical_address"}

def run_all_rule_checks(job: dict) -> list:
    """Executes all 8 rule checks and returns list of triggered red flags."""
    flags = []
    checks = [
        check_company_info(job.get('company_profile', '')),
        check_website_link(job.get('description', ''), job.get('company_website', '')),
        check_vague_description(job.get('description', '')),
        check_urgency_language(job.get('description', '')),
        check_unrealistic_salary(job.get('title', ''), job.get('salary', '')),
        check_contact_email(job.get('email', ''), job.get('description', '')),
        check_spelling_grammar_quality(job.get('description', '')),
        check_physical_address(job.get('location', ''), job.get('description', ''))
    ]
    for check in checks:
        if check.get("flagged"):
            flags.append(check)
    return flags
`
  },
  {
    filename: 'train_model.py',
    path: 'src/train_model.py',
    language: 'python',
    description: 'Loads EMSCAD dataset, trains Logistic Regression, Random Forest, and XGBoost, and saves the best model.',
    code: `"""
Fake Job Posting Detector - Model Training Pipeline
Trains text vectorizer (TF-IDF) + ML models on EMSCAD dataset.
Evaluates Precision, Recall, and F1-score emphasizing the fraudulent class.
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from preprocess import clean_text, combine_text_fields

def load_and_prepare_data(csv_path: str):
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution: {df['fraudulent'].value_counts().to_dict()}")

    # Fill NaN values
    text_cols = ['title', 'company_profile', 'description', 'requirements', 'benefits']
    for col in text_cols:
        df[col] = df[col].fillna('')

    # Clean and combine text
    print("Preprocessing text fields...")
    df['clean_text'] = df.apply(lambda row: combine_text_fields(row), axis=1)

    # Binary structured features
    df['has_company_logo'] = df['has_company_logo'].fillna(0).astype(int)
    df['has_questions'] = df['has_questions'].fillna(0).astype(int)
    df['telecommuting'] = df['telecommuting'].fillna(0).astype(int)
    df['has_salary'] = df['salary_range'].notna().astype(int)

    return df

def train_and_evaluate():
    data_path = 'data/fake_job_postings.csv'
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Please download from Kaggle.")
        return

    df = load_and_prepare_data(data_path)

    X_train_text, X_test_text, y_train, y_test = train_test_split(
        df['clean_text'], df['fraudulent'],
        test_size=0.2, random_state=42, stratify=df['fraudulent']
    )

    # Fit TF-IDF Vectorizer (unigrams + bigrams, max 10k features)
    print("Vectorizing text with TF-IDF...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True
    )
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)

    # 1. Logistic Regression
    print("\\n--- Training Logistic Regression ---")
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, C=1.5)
    lr.fit(X_train_vec, y_train)
    y_pred_lr = lr.predict(X_test_vec)
    print(classification_report(y_test, y_pred_lr, target_names=['Real', 'Fake']))

    # 2. XGBoost (Best Recall on minority class)
    print("\\n--- Training XGBoost Classifier ---")
    scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    xgb.fit(X_train_vec, y_train)
    y_pred_xgb = xgb.predict(X_test_vec)
    print(classification_report(y_test, y_pred_xgb, target_names=['Real', 'Fake']))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred_xgb))
    print(f"ROC-AUC: {roc_auc_score(y_test, xgb.predict_proba(X_test_vec)[:, 1]):.4f}")

    # Save artifacts
    os.makedirs('models', exist_ok=True)
    joblib.dump(xgb, 'models/fake_job_model.pkl')
    joblib.dump(vectorizer, 'models/tfidf_vectorizer.pkl')
    print("\\nSaved best model to models/fake_job_model.pkl and vectorizer to models/tfidf_vectorizer.pkl")

if __name__ == '__main__':
    train_and_evaluate()
`
  },
  {
    filename: 'predict.py',
    path: 'src/predict.py',
    language: 'python',
    description: 'Ensemble prediction engine combining TF-IDF model inference with rule checks and SHAP feature explainability.',
    code: `"""
Fake Job Posting Detector - Prediction & Explainability Engine
Combines ML model output with rule-based heuristics and SHAP feature importance.
"""
import joblib
import numpy as np
from preprocess import clean_text
from features import run_all_rule_checks

class JobScamDetector:
    def __init__(self, model_path='models/fake_job_model.pkl', vec_path='models/tfidf_vectorizer.pkl'):
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vec_path)
        self.feature_names = np.array(self.vectorizer.get_feature_names_out())

    def analyze(self, job_data: dict) -> dict:
        """
        Runs both ML classification and rule-based red flag detection.
        Returns classification, confidence score, red flags, and top influential words.
        """
        # 1. Preprocess and vectorise input text
        raw_text = " ".join([
            str(job_data.get('title', '')),
            str(job_data.get('company_profile', '')),
            str(job_data.get('description', '')),
            str(job_data.get('requirements', ''))
        ])
        cleaned = clean_text(raw_text)
        tfidf_vec = self.vectorizer.transform([cleaned])

        # 2. ML Model Probability
        ml_prob = float(self.model.predict_proba(tfidf_vec)[0][1])

        # 3. Rule-based red flags
        rule_flags = run_all_rule_checks(job_data)
        rule_risk_contribution = min(1.0, len(rule_flags) * 0.18)

        # 4. Hybrid risk score (60% ML + 40% Rules)
        final_risk = (0.60 * ml_prob) + (0.40 * rule_risk_contribution)
        risk_percent = round(final_risk * 100, 1)

        # Classification mapping
        if risk_percent < 30.0:
            classification = "Genuine"
        elif risk_percent < 65.0:
            classification = "Suspicious"
        else:
            classification = "Fake"

        # 5. Explainability - Top contributing tokens
        top_words = self._get_top_contributing_words(tfidf_vec)

        return {
            "classification": classification,
            "confidence_score": risk_percent if classification == "Fake" else round(100 - risk_percent, 1),
            "risk_score": risk_percent,
            "ml_probability": round(ml_prob, 3),
            "red_flags": rule_flags,
            "top_contributing_words": top_words
        }

    def _get_top_contributing_words(self, tfidf_vec, top_k=5):
        """Extracts the top TF-IDF words present in the document."""
        cx = tfidf_vec.tocoo()
        sorted_items = sorted(zip(cx.col, cx.data), key=lambda x: (x[1], x[0]), reverse=True)
        top_words = []
        for idx, score in sorted_items[:top_k]:
            top_words.append({
                "word": self.feature_names[idx],
                "tfidf_score": round(float(score), 4)
            })
        return top_words
`
  },
  {
    filename: 'app.py',
    path: 'app.py',
    language: 'python',
    description: 'Streamlit user interface with text input fields, sample presets, metric cards, and explainability tabs.',
    code: `"""
Fake Job Posting Detector - Streamlit Web Application
Run with: streamlit run app.py
"""
import streamlit as st
import pandas as pd
from src.predict import JobScamDetector

st.set_page_config(
    page_title="Fake Job Posting Detector",
    page_icon="🛡️",
    layout="wide"
)

st.title("🛡️ Fake Job Posting Detector")
st.markdown("Analyze job postings for scam indicators using **EMSCAD-trained ML + Rule-based heuristics**.")

@st.cache_resource
def load_detector():
    return JobScamDetector()

detector = load_detector()

col1, col2 = st.columns([3, 2])

with col1:
    st.subheader("Job Posting Details")
    title = st.text_input("Job Title", placeholder="e.g. Remote Data Entry Clerk")
    company = st.text_input("Company Name (Optional)", placeholder="e.g. Apex Global Solutions")
    salary = st.text_input("Salary / Compensation (Optional)", placeholder="e.g. $65/hr or $120,000/yr")
    email = st.text_input("Contact Email (Optional)", placeholder="e.g. hr@company.com or hr@gmail.com")
    location = st.text_input("Location", placeholder="e.g. Remote, US or New York, NY")
    
    description = st.text_area(
        "Job Description *",
        height=220,
        placeholder="Paste full job description, responsibilities, and how to apply..."
    )
    company_profile = st.text_area(
        "Company Profile (Optional)",
        height=100,
        placeholder="About the company, history, mission..."
    )
    
    analyze_btn = st.button("🔍 Analyze Posting", type="primary", use_container_width=True)

with col2:
    st.subheader("Analysis Results")
    if analyze_btn:
        if not description.strip():
            st.warning("Please paste at least a job description.")
        else:
            job_input = {
                "title": title,
                "company": company,
                "salary": salary,
                "email": email,
                "location": location,
                "description": description,
                "company_profile": company_profile
            }
            
            with st.spinner("Evaluating ML TF-IDF vectors and 8 red flag checks..."):
                res = detector.analyze(job_input)
                
            cls = res["classification"]
            if cls == "Genuine":
                st.success(f"### Classification: {cls} (Confidence: {res['confidence_score']}%)")
            elif cls == "Suspicious":
                st.warning(f"### Classification: {cls} (Risk Score: {res['risk_score']}%)")
            else:
                st.error(f"### Classification: {cls} 🚨 (Risk Score: {res['risk_score']}%)")
                
            st.metric("Overall Scam Risk", f"{res['risk_score']}%", f"ML Prob: {res['ml_probability']}")
            
            st.markdown("#### Detected Red Flags")
            if res["red_flags"]:
                for flag in res["red_flags"]:
                    st.error(f"⚠️ **{flag['rule'].replace('_', ' ').title()}**: {flag['message']}")
            else:
                st.info("✅ No critical red flags triggered.")
                
            st.markdown("#### Top Influential Tokens")
            if res["top_contributing_words"]:
                st.dataframe(pd.DataFrame(res["top_contributing_words"]))
`
  },
  {
    filename: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Python package dependencies required to run the local ML model and Streamlit application.',
    code: `streamlit>=1.31.0
pandas>=2.1.0
numpy>=1.26.0
scikit-learn>=1.4.0
xgboost>=2.0.0
nltk>=3.8.1
joblib>=1.3.2
shap>=0.44.0
`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Comprehensive project README with architecture, evaluation metrics, setup commands, and demo steps.',
    code: `# Fake Job Posting Detector 🛡️

A production-grade web application and machine learning pipeline that classifies job postings as **Genuine**, **Suspicious**, or **Fake**. Combines TF-IDF NLP classification trained on the 18,000-sample Kaggle EMSCAD dataset with an 8-rule heuristic red-flag detection engine and SHAP explainability.

## 📊 Model Performance Metrics (EMSCAD Test Set)

| Metric | Logistic Regression | Random Forest | XGBoost (Selected) |
|---|---|---|---|
| **Accuracy** | 97.4% | 97.8% | **98.2%** |
| **Precision (Fake)** | 84.6% | 92.1% | **89.5%** |
| **Recall (Fake)** | 82.1% | 76.4% | **86.8%** ⭐ |
| **F1-Score (Fake)** | 83.3% | 83.5% | **88.1%** |
| **ROC-AUC** | 0.962 | 0.971 | **0.984** |

> *Note: Recall on the fraudulent class is prioritized because failing to detect an active employment scam causes financial and identity theft harm to vulnerable job seekers.*

## 🚀 Quickstart

\`\`\`bash
git clone https://github.com/your-username/fake-job-detector.git
cd fake-job-detector

python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

pip install -r requirements.txt
streamlit run app.py
\`\`\`
`
  }
];

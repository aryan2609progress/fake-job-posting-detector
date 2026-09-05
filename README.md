# 🚨 Fake Job Posting Detector

> An intelligent web application for detecting potentially fraudulent job postings using **Machine Learning, NLP, TF-IDF feature analysis, and rule-based red-flag detection**.

[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7+-646CFF?logo=vite\&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Machine Learning](https://img.shields.io/badge/ML-NLP-orange)](#machine-learning--nlp)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

---

## 📌 Overview

Fake and fraudulent job postings have become increasingly sophisticated, making it difficult for job seekers to distinguish legitimate opportunities from scams.

**Fake Job Posting Detector** is a web-based application designed to analyze job postings and identify suspicious patterns using a combination of:

* 🤖 Machine Learning classification
* 🧠 Natural Language Processing
* 🔤 TF-IDF-based text analysis
* 🚩 Rule-based red-flag detection
* 📊 Model evaluation
* 📦 Batch job analysis
* 💰 Salary benchmarking
* 🔎 Explainable analysis results

The goal is not simply to label a posting as **fake or genuine**, but to provide useful signals explaining **why a job posting may be suspicious**.

---

## ✨ Key Features

### 🤖 AI/ML Job Classification

Analyze job posting information and estimate whether the posting appears legitimate or potentially fraudulent.

The analysis considers textual and structured information from the job posting to identify suspicious patterns.

### 🔤 TF-IDF Feature Explainability

The application uses **TF-IDF-based feature analysis** to identify important words and terms contributing to the textual representation of a job posting.

This helps make the analysis more interpretable instead of treating the model as a complete black box.

### 🚩 Red Flag Detection

The application includes an **8-point rule-based red-flag system** designed to identify suspicious characteristics commonly associated with fraudulent job advertisements.

Examples of suspicious signals can include:

* Requests for money or payments
* Unrealistic salary claims
* Suspicious contact information
* Missing or vague company information
* Work-from-home claims with unusual compensation
* Poorly structured job descriptions
* Suspicious application instructions
* Other scam-related patterns

### 📦 Batch Analysis

Analyze multiple job postings together instead of processing them individually.

Useful for:

* Comparing multiple opportunities
* Screening large collections of postings
* Identifying suspicious jobs quickly

### 📊 Model Evaluation

The application includes a dedicated model evaluation interface for examining classification performance and understanding model behavior.

### 💰 Salary Benchmarking

The project includes a salary benchmarking tool that can help identify potentially unrealistic compensation claims.

### 🧪 Sample Job Data

The application includes sample job postings for testing and demonstrating the detector without requiring users to immediately provide their own data.

---

# 🧠 Machine Learning & NLP

The project combines multiple approaches rather than relying on a single signal.

```text
                    Job Posting
                         │
                         ▼
                ┌─────────────────┐
                │  Text Processing │
                │      / NLP       │
                └────────┬────────┘
                         │
                         ▼
                   TF-IDF Features
                         │
                         ▼
                ┌─────────────────┐
                │ ML Classification│
                └────────┬────────┘
                         │
                         ▼
              Classification Signal
                         │
                         ├───────────────┐
                         ▼               ▼
                 Rule-Based Scan   Salary Analysis
                         │               │
                         └───────┬───────┘
                                 ▼
                         Final Analysis
                                 │
                                 ▼
                    Explanation & Red Flags
```

### TF-IDF

**Term Frequency–Inverse Document Frequency (TF-IDF)** converts text into numerical features based on the importance of terms within a document relative to the collection of documents.

This allows textual job descriptions to be processed by machine-learning algorithms.

### Rule-Based Detection

Machine learning predictions are complemented by deterministic rules that look for known suspicious patterns.

This hybrid approach provides additional interpretability and helps surface specific red flags.

---

# 📚 Dataset

The project is based on the **Employment Scam Aegean Dataset (EMSCAD)**, a commonly referenced dataset for research into fraudulent job advertisements.

The dataset contains legitimate and fraudulent job postings and provides a useful foundation for experimenting with machine-learning approaches to employment scam detection.

> **Note:** The project is intended for educational, research, and demonstration purposes. A prediction should not be treated as definitive proof that a job posting is fraudulent.

---

# 🏗️ Project Architecture

```text
fake-job-posting-detector/
│
├── src/
│   ├── components/
│   │   ├── AnalysisReport.tsx
│   │   ├── BatchAnalyzer.tsx
│   │   ├── FeedbackModal.tsx
│   │   ├── JobForm.tsx
│   │   ├── ModelEvaluationHub.tsx
│   │   ├── Navbar.tsx
│   │   ├── PythonProjectExport.tsx
│   │   └── SalaryBenchmarkTool.tsx
│   │
│   ├── data/
│   │   ├── emscadData.ts
│   │   ├── pythonCodeArtifacts.ts
│   │   └── sampleJobs.ts
│   │
│   ├── utils/
│   │   ├── nlpEngine.ts
│   │   └── redFlagRules.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── index.html
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── metadata.json
├── .env.example
├── .gitignore
└── README.md
```

---

# 🛠️ Tech Stack

| Technology           | Purpose                           |
| -------------------- | --------------------------------- |
| **React**            | Frontend UI                       |
| **TypeScript**       | Type-safe application development |
| **Vite**             | Development and build tooling     |
| **Node.js**          | Server-side runtime               |
| **TSX**              | TypeScript execution              |
| **NLP / TF-IDF**     | Text feature extraction           |
| **Machine Learning** | Job classification                |
| **CSS**              | UI styling                        |
| **EMSCAD**           | Dataset / research foundation     |

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* [Node.js](https://nodejs.org/)
* npm
* Git

Check your installation:

```bash
node --version
npm --version
git --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/aryan2609progress/fake-job-posting-detector.git
```

Move into the project:

```bash
cd fake-job-posting-detector
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Environment Variables

If the project requires environment variables, create a `.env` file based on:

```text
.env.example
```

Example:

```bash
cp .env.example .env
```

> Never commit private API keys, credentials, or secrets to GitHub.

---

## 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application should be available at:

```text
http://localhost:3000
```

---

# 🧪 Example Workflow

A typical analysis follows this flow:

```text
1. Enter job posting
        ↓
2. Extract relevant information
        ↓
3. Process job description
        ↓
4. Generate NLP / TF-IDF features
        ↓
5. Run classification
        ↓
6. Apply red-flag rules
        ↓
7. Evaluate suspicious signals
        ↓
8. Generate analysis report
```

---

# 🔍 Why a Hybrid Approach?

A pure machine-learning prediction can tell us **what the model predicts**, but may not clearly communicate **why the posting looks suspicious**.

This project therefore combines:

### Machine Learning

Provides a data-driven classification signal.

### NLP / TF-IDF

Extracts useful textual features from job descriptions.

### Rule-Based Detection

Highlights concrete suspicious patterns.

### Salary Benchmarking

Provides additional context when compensation appears unusual.

Together, these components provide a more informative analysis experience.

---

# 📊 Model Evaluation

The project includes tools for evaluating the classification approach and understanding its performance.

Common evaluation concepts include:

* Accuracy
* Precision
* Recall
* F1 Score
* Confusion Matrix

For fraud detection, **precision and recall are particularly important**, since both false positives and missed fraudulent postings can have meaningful consequences.

---

# 🔐 Security & Privacy

This project is intended for educational and research purposes.

When deploying or extending the application:

* Never expose API keys in frontend code.
* Keep secrets inside environment variables.
* Do not commit `.env` files.
* Avoid storing personally identifiable information unnecessarily.
* Validate user-provided job posting content.

---

# ⚠️ Disclaimer

This application provides an **automated risk assessment**, not a definitive determination of whether a job is fraudulent.

A job classified as suspicious may still be legitimate, and a job classified as legitimate may still require verification.

Always independently verify:

* Company identity
* Official company website
* Recruiter identity
* Email domain
* Salary and benefits
* Interview process
* Payment requirements

**Never pay money to obtain a job.**

---

# 🔮 Future Improvements

Potential future enhancements include:

* [ ] Real-time job-board integration
* [ ] Transformer-based NLP models
* [ ] BERT/RoBERTa-based classification
* [ ] Explainable AI with SHAP/LIME
* [ ] Improved model calibration
* [ ] Automated model retraining
* [ ] Larger and more diverse datasets
* [ ] Browser extension for real-time job analysis
* [ ] URL-based job posting extraction
* [ ] Cloud deployment
* [ ] User feedback-based model improvement

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### Fork the repository

```bash
git fork
```

### Create a feature branch

```bash
git checkout -b feature/your-feature
```

### Commit your changes

```bash
git commit -m "Add your feature"
```

### Push the branch

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📜 License

This project is intended for educational and research purposes.

If you choose to distribute this project publicly, add the appropriate license file to the repository.

---

# 👨‍💻 Author

**Aryan Singh**

Computer Science / Engineering Student
Interested in **Machine Learning, NLP, Data Structures & Algorithms, and AI Engineering**.

### Connect

* GitHub: [@aryan2609progress](https://github.com/aryan2609progress)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

<div align="center">

### 🚨 Detect suspicious jobs before they become costly mistakes.

**Built with React • TypeScript • NLP • Machine Learning**

</div>

import os
import json
from openai import OpenAI
from django.conf import settings

def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", "")
    if api_key and not api_key.startswith("your_") and len(api_key) > 10:
        try:
            return OpenAI(api_key=api_key)
        except Exception as e:
            print(f"[OpenAI Client Init Error]: {e}")
            return None
    return None

def is_sap_context(module: str, topic: str, meeting_name: str) -> bool:
    """Detects whether the meeting is specifically an SAP ERP workshop or another tech/business meeting."""
    mod = (module or "").upper().strip()
    if mod in ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS', 'FICO', 'ABAP', 'RICEFW']:
        return True
    
    combined = f" {module} {topic} {meeting_name} ".upper()
    sap_keywords = ['S/4HANA', 'S4HANA', 'SAP', 'FICO', 'ABAP', 'RICEFW', 'ECC', 'BTP']
    for kw in sap_keywords:
        if kw in combined:
            return True
            
    for kw in ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS']:
        if f" {kw} " in combined or f"({kw})" in combined or f"[{kw}]" in combined or f"/{kw}" in combined or f"-{kw}" in combined:
            return True
            
    return False

def generate_pre_meeting_preparation(
    topic: str = "Meeting Session",
    industry: str = "General",
    module: str = "Cross-Module",
    project_name: str = "Project Transformation",
    meeting_name: str = "Project Meeting",
    document_context: str = ""
):
    """
    Pathway 3: 100% Dynamic Pre-Meeting Intelligence.
    Generates tailored must-ask questions, risks, agenda, and readiness scores using OpenAI gpt-4o-mini,
    heavily augmented by any attached scope documents.
    """
    client = get_openai_client()
    if not client:
        raise RuntimeError("OpenAI API is not configured or OPENAI_API_KEY is missing in backend/.env. Please configure a valid OpenAI API key.")

    is_sap = is_sap_context(module, topic, meeting_name)
    is_ai = any(k in f"{meeting_name} {topic}".upper() for k in ['AI', 'ML', 'MODEL', 'LLM', 'GPT', 'INTELLIGENCE', 'ALGORITHM', 'DATA SCIENCE', 'VISION', 'NLP'])

    if is_sap:
        domain_role = "Principal SAP S/4HANA Solution Architect"
        domain_guidance = f"This is an SAP ERP engagement focusing specifically on {module} in the {industry} industry."
    elif is_ai:
        domain_role = "Principal AI & Machine Learning Solutions Architect"
        domain_guidance = f"This is an AI/ML specialized meeting titled '{meeting_name}' (Topic: '{topic}', Domain: '{industry}'). Focus questions strictly on AI model architecture, training data & pipelines, prompt engineering / fine-tuning, latency / throughput, guardrails / hallucinations, ground-truth evaluation benchmarks, and production integration."
    else:
        domain_role = "Senior Enterprise Technical Lead & Solutions Architect"
        domain_guidance = f"This is a specialized project meeting focusing on: '{meeting_name}' (Topic: '{topic}', Domain/Industry: '{industry}'). Generate questions deeply relevant to this specific meeting subject, architecture, deliverables, evaluation criteria, and operational goals. DO NOT mention SAP unless explicitly requested."

    doc_directive = ""
    if document_context and document_context.strip():
        doc_directive = f"""
======================================================================
ATTACHED PROJECT SCOPE & SPECIFICATION DOCUMENTS:
{document_context[:25000]}
======================================================================

DOCUMENT-DRIVEN DIRECTIVE:
The above text was extracted directly from project scope documents (BRD, RFP, SRS, or Technical Specs) uploaded specifically for this meeting.
You MUST:
1. Deeply analyze this document content and synthesize questions that directly challenge, clarify, and validate specific clauses, architecture requirements, data flows, and edge cases from this document.
2. Formulate questions that explicitly cite and reference the specific sections, requirements, numbers, or rules found in the attached documents.
3. Uncover unaddressed dependencies, ambiguities, or technical risks in the document.
"""

    prompt = f"""
You are a {domain_role}.
Prepare a comprehensive, highly professional Pre-Meeting Preparation plan for an upcoming meeting.

Meeting Context:
- Meeting Title: {meeting_name}
- Specific Topic / Scope: {topic}
- Industry / Sector: {industry}
- Functional Area / Module: {module}
- Project: {project_name}
- Domain Guidance: {domain_guidance}
{doc_directive}

CRITICAL GENERATION RULES:
1. MANDATORY ENGLISH ONLY: ALL output fields (meeting objective, topics, questions, justification reasons, categories) MUST BE WRITTEN 100% IN CLEAR, PROFESSIONAL ENGLISH. If any input context or document contains Hindi, Gujarati, or any non-English text, TRANSLATE IT TO ENGLISH.
2. You MUST generate AT LEAST 5 to 8 high-impact, realistic, deeply relevant questions specific to '{meeting_name}', '{topic}', and any attached scope documents.
3. Formulate 100% realistic, substantive questions tailored to the meeting topic. NEVER return generic placeholders.
4. Every question must include detailed, plausible justification reasons and domain tags in English.
5. If scope documents are attached, at least 3-4 questions MUST directly reference the document's specific contents.
6. Set realistic priorities ('Critical', 'High', 'Medium') and confidence scores (82-98%).
7. Return valid JSON only.

Required JSON Structure:
{{
  "project": "{project_name}",
  "meetingName": "{meeting_name}",
  "date": "Upcoming Session",
  "time": "Scheduled",
  "moduleLabel": "{module} / {topic}",
  "objective": "A concise, specific executive objective for this meeting reflecting '{meeting_name}'.",
  "participants": [
    {{"name": "Consultant / Lead", "role": "Project Lead"}},
    {{"name": "Client / Stakeholder", "role": "{industry} Domain Lead"}}
  ],
  "topics": ["Focus Topic 1", "Focus Topic 2", "Focus Topic 3", "Focus Topic 4", "Focus Topic 5"],
  "readiness": {{
    "overall": 92,
    "projectKnowledge": 95,
    "openRequirements": 88,
    "questionCoverage": 90
  }},
  "recommendedQuestions": [
    {{
      "id": "rq-1",
      "priority": "Critical",
      "module": "{module}",
      "topic": "Domain Architecture",
      "question": "Realistic specific question 1 here...",
      "reasons": [
        "Clear reason 1 why this matters for {meeting_name}",
        "Clear reason 2 regarding dependencies or risks"
      ],
      "source": "Project Best Practices & Domain Knowledge",
      "confidence": 95
    }},
    {{
      "id": "rq-2",
      "priority": "Critical",
      "module": "{module}",
      "topic": "Key Workflow",
      "question": "Realistic specific question 2 here...",
      "reasons": ["Reason 1", "Reason 2"],
      "source": "Project Best Practices & Domain Knowledge",
      "confidence": 92
    }},
    {{
      "id": "rq-3",
      "priority": "High",
      "module": "{module}",
      "topic": "Integration & Data",
      "question": "Realistic specific question 3 here...",
      "reasons": ["Reason 1", "Reason 2"],
      "source": "Project Best Practices & Domain Knowledge",
      "confidence": 89
    }},
    {{
      "id": "rq-4",
      "priority": "High",
      "module": "{module}",
      "topic": "Governance & Compliance",
      "question": "Realistic specific question 4 here...",
      "reasons": ["Reason 1", "Reason 2"],
      "source": "Project Best Practices & Domain Knowledge",
      "confidence": 87
    }},
    {{
      "id": "rq-5",
      "priority": "Medium",
      "module": "{module}",
      "topic": "Milestones & Validation",
      "question": "Realistic specific question 5 here...",
      "reasons": ["Reason 1", "Reason 2"],
      "source": "Project Best Practices & Domain Knowledge",
      "confidence": 84
    }}
  ],
  "alreadyCovered": [
    "Prior baseline requirements reviewed",
    "Key stakeholders and high-level roadmap established"
  ]
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior enterprise project consultant and solution architect. CRITICAL INSTRUCTION: ALL OUTPUT MUST BE 100% IN ENGLISH. Always return clean, valid JSON with at least 5-8 detailed questions in English. Never use placeholders or any non-English language under any circumstance."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        data = json.loads(response.choices[0].message.content)
        
        # Enforce maximum 5 focus topics
        if data.get("topics") and isinstance(data["topics"], list):
            data["topics"] = data["topics"][:5]

        return data
    except Exception as e:
        print(f"[OpenAI Dynamic Generation Error]: {e}")
        raise RuntimeError(f"OpenAI Generation Failed: {str(e)}")


def analyze_post_meeting_transcript(
    transcript: str,
    topic: str = "Meeting Workshop",
    module: str = "Cross-Module",
    industry: str = "General",
    document_context: str = ""
):
    """
    Pathway 4: 100% Dynamic Post-Meeting Intelligence.
    Extracts questions asked & answered, critical missed questions (domain gaps), decisions, risks, and action items
    directly from transcript and attached scope documents via OpenAI gpt-4o-mini.
    """
    client = get_openai_client()
    if not client:
        raise RuntimeError("OpenAI API is not configured or OPENAI_API_KEY is missing in backend/.env. Please configure a valid OpenAI API key.")

    if not transcript or len(transcript.strip()) < 10:
        raise ValueError("Meeting transcript is empty or too short for AI gap analysis.")

    is_sap = is_sap_context(module, topic, topic)
    domain_role = "Principal SAP Quality & Solution Assurance Auditor" if is_sap else "Senior Enterprise Project Quality & Technical Auditor"
    domain_guidance = (
        f"This was an SAP ERP meeting focusing on {module}."
        if is_sap else
        f"This was a technical/business project meeting on '{topic}' ({industry} domain). Extract decisions, requirements, and gaps tailored to this specific subject."
    )

    doc_section = ""
    if document_context and document_context.strip():
        doc_section = f"""
Attached Project Scope / Specification Documents:
\"\"\"{document_context[:15000]}\"\"\"

SCOPE AUDIT DIRECTIVE:
Compare the meeting transcript against the attached scope documents.
Identify any deliverables, architectural requirements, data contracts, or business rules mentioned in the scope document that the meeting participants failed to discuss, verify, or resolve. Highlight them under 'unresolvedRisks', 'missedQuestions', and 'openQuestions'.
"""

    prompt = f"""
You are a {domain_role}.
Analyze the following meeting transcript for a meeting titled '{topic}' (Module/Scope: {module}, Industry: {industry}).

Domain Guidance: {domain_guidance}
{doc_section}

Transcript:
\"\"\"{transcript[:15000]}\"\"\"

CRITICAL ANALYSIS INSTRUCTIONS:
1. MANDATORY ENGLISH ONLY: ALL JSON values, questions, answers, missed questions, decisions, requirements, risks, and action items MUST BE 100% IN CLEAR, PROFESSIONAL ENGLISH. If the transcript or input is in Hindi, Gujarati, Spanish, German, Hinglish, or any other language, you MUST TRANSLATE every question, statement, decision, and requirement into clean, fluent English. NEVER output Devanagari script, Hindi, or any non-English text under any circumstance.
2. Extract ALL questions that were asked and answered in the transcript (translated into English). Minimum 3 to 6 questions.
3. Identify at least 3 to 5 CRITICAL MISSED QUESTIONS in English (crucial domain, architectural, or technical questions that the attendees forgot or failed to ask). NEVER output generic placeholder text.
4. Extract concrete decisions finalized during the discussion in English.
5. Extract specific new requirements in English (format with IDs like REQ-001, REQ-002, etc.).
6. Extract risks and follow-up action items in English with clear owners.
7. Return valid JSON only matching the schema below.

Required JSON Structure:
{{
  "project": "Project Engagement",
  "meetingName": "{topic}",
  "date": "Completed Session",
  "summary": {{
    "questionsIdentified": 10,
    "asked": 7,
    "answered": 6,
    "partial": 1,
    "missed": 3,
    "newRequirements": 3,
    "decisions": 3,
    "risks": 2
  }},
  "questionsAsked": [
    {{"question": "Realistic question that was asked during the meeting (translated to English)?", "status": "Answered"}}
  ],
  "missedQuestions": [
    {{
      "question": "Important question in English that should have been asked regarding '{topic}' but was missed?",
      "priority": "Critical",
      "confidence": 94
    }}
  ],
  "newRequirements": [
    {{"id": "REQ-01", "text": "Specific requirement in English identified from discussion..."}}
  ],
  "decisions": [
    {{"text": "Key technical or business decision in English finalized...", "module": "{module}"}}
  ],
  "risks": [
    {{"text": "Specific operational or technical risk in English identified...", "severity": "High"}}
  ],
  "followUpActions": [
    "Specific action item 1 in English with deliverable...",
    "Specific action item 2 in English..."
  ]
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert solution auditor. CRITICAL INSTRUCTION: ALL OUTPUT MUST BE 100% IN ENGLISH. If the transcript or input is in Hindi, Gujarati, or any non-English language, you MUST TRANSLATE all extracted questions, missed questions, decisions, requirements, and actions into fluent, professional English. Always return clean, valid JSON strictly in English."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"[OpenAI Dynamic Post-Meeting Analysis Error]: {e}")
        raise RuntimeError(f"Post-Meeting Analysis Failed: {str(e)}")

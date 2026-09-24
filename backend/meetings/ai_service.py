import os
import json
import uuid
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

def get_architecture_guidance(erp_system: str, module: str, industry: str, topic: str, meeting_name: str):
    """Returns domain_role and domain_guidance tailored to the exact ERP architecture & scope."""
    erp_upper = (erp_system or "").upper()
    is_sap = is_sap_context(module, topic, meeting_name) or "SAP" in erp_upper or "ECC" in erp_upper or "S/4" in erp_upper or "S4" in erp_upper

    if "PUBLIC CLOUD" in erp_upper or "GROW WITH SAP" in erp_upper:
        domain_role = f"Principal SAP S/4HANA Public Cloud (Clean Core) Solution Architect ({module})"
        domain_guidance = (
            f"This is an SAP S/4HANA PUBLIC CLOUD (Multi-Tenant SaaS / Grow with SAP) engagement for {module} in the {industry} sector.\n"
            f"CRITICAL PUBLIC CLOUD RULES FOR QUESTIONS:\n"
            f"- Strictly enforce 'Clean Core' paradigm and SAP standard Best Practice Scope Items (Fit-to-Standard methodology).\n"
            f"- Questions must probe into standard process adoption vs custom gaps, In-App Key User Extensibility (custom fields/logic), Developer Extensibility (Embedded ABAP Cloud / RAP in Eclipse ADT), and Side-by-Side Extensibility on SAP BTP (Business Technology Platform).\n"
            f"- Forbid traditional classic user exits, SE38 modifications, or direct database writes. Ask about SAP CBC (Central Business Configuration) and standard OData/REST API integrations."
        )
    elif "ECC" in erp_upper:
        domain_role = f"Principal SAP ECC 6.0 & Modernization Solution Architect ({module})"
        domain_guidance = (
            f"This is an SAP ECC 6.0 (Legacy Suite) engagement for {module} in the {industry} sector.\n"
            f"CRITICAL ECC 6.0 RULES FOR QUESTIONS:\n"
            f"- Focus on legacy table models (BKPF/BSEG/BSIS/MSEG/MKPF/VBAK/VBAP), classic transaction codes (XD01/XK01/ME21N/VA01), custom user exits, BAdIs, and standard SPRO IMG configurations.\n"
            f"- Include questions addressing separate FI/CO ledger reconciliations, custom Z-reports, and assessing technical debt / migration readiness toward S/4HANA."
        )
    elif "BTP" in erp_upper:
        domain_role = f"Principal SAP BTP & Enterprise Integration Architect"
        domain_guidance = (
            f"This is an SAP BTP (Business Technology Platform) & Extension Suite engagement ({industry} sector).\n"
            f"CRITICAL BTP RULES FOR QUESTIONS:\n"
            f"- Focus questions on side-by-side extensions, SAP Integration Suite / Cloud Integration, OData APIs, SAP Event Mesh, Cloud Application Programming (CAP), and SAP Build Workzone."
        )
    elif is_sap:
        domain_role = f"Principal SAP S/4HANA Solution Architect ({module})"
        domain_guidance = (
            f"This is an SAP S/4HANA (Private Cloud / On-Premise) engagement focusing on {module} in the {industry} sector.\n"
            f"CRITICAL S/4HANA RULES FOR QUESTIONS:\n"
            f"- Focus questions on Universal Journal (ACDOCA), Business Partner (BP) synchronization, Material Ledger, Embedded Analytics, Advanced ATP (aATP), and Fiori app integration alongside classic GUI.\n"
            f"- Target both Greenfield implementation and Brownfield system conversion (simplification item checks, custom code remediation via ATC)."
        )
    elif any(k in f"{meeting_name} {topic}".upper() for k in ['AI', 'ML', 'MODEL', 'LLM', 'GPT', 'INTELLIGENCE', 'ALGORITHM', 'DATA SCIENCE', 'VISION', 'NLP']):
        domain_role = "Principal AI & Machine Learning Solutions Architect"
        domain_guidance = f"This is an AI/ML specialized meeting titled '{meeting_name}' (Topic: '{topic}', Domain: '{industry}'). Focus questions strictly on AI model architecture, training data & pipelines, prompt engineering / fine-tuning, latency / throughput, guardrails / hallucinations, ground-truth evaluation benchmarks, and production integration."
    else:
        domain_role = "Senior Enterprise Technical Lead & Solutions Architect"
        domain_guidance = f"This is a specialized project meeting focusing on: '{meeting_name}' (Topic: '{topic}', Domain/Industry: '{industry}', Platform: '{erp_system}'). Generate questions deeply relevant to this specific meeting subject, architecture, deliverables, evaluation criteria, and operational goals. DO NOT mention SAP unless explicitly requested."

    return domain_role, domain_guidance

def generate_pre_meeting_preparation(
    topic: str = None,
    industry: str = None,
    module: str = None,
    project_name: str = None,
    meeting_name: str = None,
    document_context: str = "",
    erp_system: str = "SAP S/4HANA (Private / On-Premise)",
    cross_meeting_context: str = ""
):
    """
    Pathway 3: 100% Dynamic Pre-Meeting Intelligence.
    Generates tailored must-ask questions, risks, agenda, and readiness scores using OpenAI gpt-4o-mini,
    heavily augmented by any attached scope documents, project memory, and chosen ERP Architecture.
    """
    client = get_openai_client()
    if not client:
        raise RuntimeError("OpenAI API is not configured or OPENAI_API_KEY is missing in backend/.env. Please configure a valid OpenAI API key.")

    domain_role, domain_guidance = get_architecture_guidance(erp_system, module, industry, topic, meeting_name)

    doc_directive = ""
    if document_context and document_context.strip():
        doc_directive = f"""
======================================================================
ATTACHED PROJECT SCOPE & SPECIFICATION DOCUMENTS:
{document_context[:25000]}
======================================================================

DOCUMENT-DRIVEN DIRECTIVE:
The above text was extracted directly from project scope documents (BRD, RFP, SRS, or Technical Specs) uploaded specifically for this meeting/project.
You MUST:
1. Deeply analyze this document content and synthesize questions that directly challenge, clarify, and validate specific clauses, architecture requirements, data flows, and edge cases from this document.
2. Formulate questions that explicitly cite and reference the specific sections, requirements, numbers, or rules found in the attached documents.
3. Uncover unaddressed dependencies, ambiguities, or technical risks in the document.
"""

    cross_meeting_directive = ""
    if cross_meeting_context and cross_meeting_context.strip():
        cross_meeting_directive = f"""
======================================================================
CROSS-MEETING INSTITUTIONAL MEMORY (HISTORICAL WORKSHOPS IN THIS PROJECT):
{cross_meeting_context[:20000]}
======================================================================

CROSS-MEETING CONTINUITY DIRECTIVE:
The above records represent confirmed architectural decisions, master requirements (REQ-xxx), and unresolved/open questions from prior workshops in this same client project.
You MUST:
1. Maintain strict project continuity: Formulate questions that directly address or resolve points left open/unresolved in previous workshops.
2. DO NOT re-ask questions about decisions that were already finalized and confirmed in earlier meetings unless exploring a critical downstream impact.
3. Reference prior meeting outcomes (e.g., 'Building upon the decision in Workshop 1 to use standard batch classification, how will...') where appropriate.
4. Include confirmed prior decisions in the 'alreadyCovered' output list.
"""

    prompt = f"""
You are a {domain_role}.
Generate a comprehensive Pre-Meeting Preparation intelligence package for an upcoming meeting.

Meeting Details:
- Meeting Name: {meeting_name}
- Specific Scope / Topic: {topic}
- Functional Module: {module}
- Industry: {industry}
- ERP System & Architecture: {erp_system}
- Project: {project_name}
- Domain & Architecture Guidance:
{domain_guidance}
{doc_directive}
{cross_meeting_directive}


SENIOR CONSULTANT QUESTION CRITERIA:
1. MANDATORY ENGLISH ONLY: ALL generated content (objective, topics, questions, reasons, alreadyCovered) MUST be 100% in clear, professional English.
2. HIGH-VALUE & IMPACT ONLY: Do NOT generate trivial, obvious, or generic questions (e.g., "What is the project timeline?" or "Who is the contact?"). Every question must be a substantive, architectural, functional, or integration challenge that uncovers risks, hidden dependencies, boundary conditions, or data contract specifics for {erp_system}.
3. DOCUMENT CITATION: If scope documents are provided above, at least 3-4 questions MUST cite specific requirements, rules, tables, or process flows from the attached text.
4. Provide between 5 to 8 deeply relevant discovery questions. Each question must include 2 concrete justification bullet points explaining why it is critical to ask.
5. Provide realistic, contextual readiness scores (0-100) reflecting how well-scoped the meeting topic is given the available information and documents.
6. Return valid JSON only matching the schema below.

Required JSON Structure:
{{
  "project": "{project_name}",
  "meetingName": "{meeting_name}",
  "date": "Upcoming Session",
  "time": "Scheduled",
  "moduleLabel": "{module} / {topic}",
  "objective": "A sharp, executive objective in English defining what must be agreed or validated in this meeting.",
  "participants": [
    {{"name": "Consultant / Architect", "role": "Lead {module} Architect"}},
    {{"name": "Client Stakeholder", "role": "{industry} Process Owner"}}
  ],
  "topics": [
    "High-level focus area 1",
    "High-level focus area 2",
    "High-level focus area 3"
  ],
  "readiness": {{
    "overall": 88,
    "projectKnowledge": 90,
    "openRequirements": 85,
    "questionCoverage": 89
  }},
  "recommendedQuestions": [
    {{
      "id": "rq-1",
      "priority": "Critical",
      "module": "{module}",
      "topic": "Architecture & Integration",
      "question": "Deep, high-value technical/process discovery question...",
      "reasons": [
        "Concrete justification 1 regarding risks or dependencies",
        "Concrete justification 2 regarding architectural validation"
      ],
      "source": "Architecture Best Practices & Scope Analysis",
      "confidence": 95
    }}
  ],
  "alreadyCovered": [
    "Key baseline item 1 already confirmed",
    "Key baseline item 2 already established"
  ]
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a Principal Enterprise Solution Architect. CRITICAL: All output must be 100% in professional English. Generate only deeply relevant, high-impact discovery questions tailored specifically to the ERP architecture and scope. Never generate generic or filler questions. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.65
        )
        data = json.loads(response.choices[0].message.content)
        
        # Enforce maximum 5 focus topics
        if data.get("topics") and isinstance(data["topics"], list):
            data["topics"] = data["topics"][:5]

        # Ensure question IDs are unique and structured
        if data.get("recommendedQuestions") and isinstance(data["recommendedQuestions"], list):
            for idx, q in enumerate(data["recommendedQuestions"]):
                if not q.get("id"):
                    q["id"] = f"rq-{idx + 1}"
                if not q.get("module"):
                    q["module"] = module or "Cross-Module"
                if not q.get("source"):
                    q["source"] = "AI Architecture Audit"
                if not q.get("confidence"):
                    q["confidence"] = 90

        # Dynamically calculate readiness if missing
        if "readiness" not in data or not isinstance(data["readiness"], dict):
            doc_boost = 10 if (document_context and len(document_context) > 100) else 0
            base_score = min(95, 80 + doc_boost + min(len(data.get("recommendedQuestions", [])) * 2, 10))
            data["readiness"] = {
                "overall": base_score,
                "projectKnowledge": min(98, base_score + 3),
                "openRequirements": max(75, base_score - 5),
                "questionCoverage": min(96, base_score + 2)
            }

        return data
    except Exception as e:
        print(f"[OpenAI Dynamic Generation Error]: {e}")
        raise RuntimeError(f"OpenAI Generation Failed: {str(e)}")


def generate_replacement_question(
    topic: str = None,
    industry: str = None,
    module: str = None,
    meeting_name: str = None,
    project_name: str = None,
    document_context: str = "",
    skipped_question: str = "",
    existing_questions: list = None,
    erp_system: str = "SAP S/4HANA (Private / On-Premise)"
) -> dict:
    """
    Generates a single brand new, high-impact discovery question using OpenAI gpt-4o-mini
    to replace a skipped question, ensuring it is distinct from any existing questions.
    """
    client = get_openai_client()
    if not client:
        raise RuntimeError("OpenAI API is not configured or OPENAI_API_KEY is missing in backend/.env.")

    domain_role, domain_guidance = get_architecture_guidance(erp_system, module, industry, topic, meeting_name)

    existing_list = "\n".join([f"- {q}" for q in (existing_questions or []) if q])
    
    doc_directive = ""
    if document_context and document_context.strip():
        doc_directive = f"""
ATTACHED PROJECT SCOPE & SPECIFICATION DOCUMENTS:
{document_context[:10000]}
"""

    prompt = f"""
You are a {domain_role}.
Generate exactly ONE new, high-impact discovery question for an upcoming meeting to replace a skipped question.

Meeting Context:
- Meeting Title: {meeting_name}
- Specific Topic / Scope: {topic}
- Industry / Sector: {industry}
- Functional Area / Module: {module}
- ERP System & Architecture: {erp_system}
- Project: {project_name}
- Domain Guidance: {domain_guidance}
{doc_directive}

QUESTION BEING SKIPPED:
"{skipped_question}"

CURRENT QUESTIONS ALREADY IN THE LIST (DO NOT DUPLICATE THESE):
{existing_list}

RULES:
1. MANDATORY ENGLISH ONLY.
2. Formulate a 100% realistic, substantive, high-impact architectural, functional, or integration question tailored specifically to {erp_system} and '{topic}'. Strictly forbid trivial, obvious, or generic questions.
3. Do NOT repeat or paraphrase the skipped question or any existing question.
4. Include 2 concrete justification bullet points explaining why this question is crucial to ask during the workshop.
5. Set priority ('Critical', 'High', 'Medium') and confidence score (85-98%).

Required JSON Structure:
{{
  "id": "rq-new-{uuid.uuid4().hex[:6]}",
  "priority": "High",
  "module": "{module}",
  "topic": "Architecture & Operations",
  "question": "The new specific question here...",
  "reasons": [
    "Reason 1 why this matters",
    "Reason 2 regarding validation or dependencies"
  ],
  "source": "AI Dynamic Generation",
  "confidence": 92
}}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior enterprise project consultant and solution architect. CRITICAL: ALL OUTPUT MUST BE 100% IN ENGLISH. Return a single new question object in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.8
        )
        data = json.loads(response.choices[0].message.content)
        if "id" not in data or not data["id"]:
            data["id"] = f"rq-new-{uuid.uuid4().hex[:6]}"
        if "reasons" not in data or not isinstance(data["reasons"], list):
            data["reasons"] = ["Targeted validation required for project scope.", "Identified as key operational dependency."]
        if "source" not in data:
            data["source"] = "AI Dynamic Generation"
        if "confidence" not in data:
            data["confidence"] = 92
        return data
    except Exception as e:
        print(f"[OpenAI Replacement Generation Error]: {e}")
        raise RuntimeError(f"Failed to generate replacement question: {str(e)}")


def analyze_post_meeting_transcript(
    transcript: str,
    topic: str = None,
    module: str = None,
    industry: str = None,
    document_context: str = "",
    erp_system: str = "SAP S/4HANA (Private / On-Premise)"
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

    domain_role, domain_guidance = get_architecture_guidance(erp_system, module, industry, topic, topic)

    doc_section = ""
    if document_context and document_context.strip():
        doc_section = f"""
Attached Project Scope / Specification Documents:
\"\"\"{document_context[:15000]}\"\"\"

SCOPE AUDIT DIRECTIVE:
Compare the meeting transcript against the attached scope documents and {erp_system} architectural requirements.
Identify any deliverables, architectural requirements, data contracts, or business rules mentioned in the scope document that the meeting participants failed to discuss, verify, or resolve. Highlight them under 'unresolvedRisks', 'missedQuestions', and 'openQuestions'.
"""

    prompt = f"""
You are a {domain_role}.
Analyze the following meeting transcript for a meeting titled '{topic}' (Module/Scope: {module}, Industry: {industry}, Architecture: {erp_system}).

Domain Guidance: {domain_guidance}
{doc_section}

Transcript:
\"\"\"{transcript[:15000]}\"\"\"

CRITICAL ANALYSIS INSTRUCTIONS:
1. MANDATORY ENGLISH ONLY: ALL JSON values, questions, answers, missed questions, decisions, requirements, risks, and action items MUST BE 100% IN CLEAR, PROFESSIONAL ENGLISH. If the transcript or input is in Hindi, Gujarati, Spanish, German, Hinglish, or any other language, you MUST TRANSLATE every question, statement, decision, and requirement into clean, fluent English. NEVER output Devanagari script, Hindi, or any non-English text under any circumstance.
2. EXHAUSTIVE EXTRACTION OF ALL SPOKEN QUESTIONS & QUERIES:
Analyze the transcript line-by-line. Extract EVERY question, query, verification check, or inquiry spoken during this meeting without omitting any:
- Audio/connection checks ('Is my voice clear / Am I audible?')
- Screen sharing/visibility checks ('Is my screen visible / Can you see my screen?')
- Language/format preferences ('Can we speak in Hindi or English?')
- Platform, architectural, or functional questions ('What is in the meetings?', 'Can I see an example?', etc.)
- Confirmation & comprehension checks ('Got it?', 'Do you understand?')
- Greetings & status inquiries ('How are you today?')
Note: Spoken transcripts often lack a formal question mark (e.g. transcribed with a period like 'My voice is clear.' or 'so then my screen is visible.'). You MUST recognize these as questions asked and extract them cleanly.
For each question, extract the exact answer/explanation provided in the discussion.
Status: "Answered" if answered, "Partial" if incomplete, "Unanswered" if skipped.
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
    "questionsIdentified": 0,
    "asked": 0,
    "answered": 0,
    "partial": 0,
    "missed": 0,
    "newRequirements": 0,
    "decisions": 0,
    "risks": 0
  }},
  "questionsAsked": [
    {{
      "question": "Exact question asked in the meeting (translated to English)?",
      "status": "Answered",
      "answer": "Detailed concise explanation of the answer/response provided in the discussion (in English).",
      "answeredBy": "Speaker / Role who answered"
    }}
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
                {"role": "system", "content": "You are an expert solution auditor. CRITICAL INSTRUCTION: ALL OUTPUT MUST BE 100% IN ENGLISH. If the transcript or input is in Hindi, Gujarati, or any non-English language, you MUST TRANSLATE all extracted questions, missed questions, decisions, requirements, and actions into fluent, professional English. Always extract every question, verification check, and feature inquiry line-by-line. Always return clean, valid JSON strictly in English."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.25
        )
        data = json.loads(response.choices[0].message.content)
        
        # Ensure summary numbers strictly match extracted arrays
        qs_asked = data.get("questionsAsked", [])
        missed_qs = data.get("missedQuestions", [])
        answered_cnt = sum(1 for q in qs_asked if isinstance(q, dict) and q.get("status") == "Answered")
        partial_cnt = sum(1 for q in qs_asked if isinstance(q, dict) and q.get("status") == "Partial")
        
        if "summary" not in data or not isinstance(data["summary"], dict):
            data["summary"] = {}
            
        data["summary"]["asked"] = len(qs_asked)
        data["summary"]["answered"] = answered_cnt
        data["summary"]["partial"] = partial_cnt
        data["summary"]["missed"] = len(missed_qs)
        data["summary"]["questionsIdentified"] = len(qs_asked) + len(missed_qs)
        data["summary"]["newRequirements"] = len(data.get("newRequirements", []))
        data["summary"]["decisions"] = len(data.get("decisions", []))
        data["summary"]["risks"] = len(data.get("risks", []))
        
        return data
    except Exception as e:
        print(f"[OpenAI Dynamic Post-Meeting Analysis Error]: {e}")
        raise RuntimeError(f"Post-Meeting Analysis Failed: {str(e)}")

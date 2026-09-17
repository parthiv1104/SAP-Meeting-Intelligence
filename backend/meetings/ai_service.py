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
    # Explicit SAP functional modules (excluding generic categories like Other, Cross-Module, General)
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
    Pathway 3: Pre-Meeting Intelligence.
    Dynamically generates minimum 5-8 tailored must-ask questions, risks, agenda, and readiness
    for ANY meeting domain (AI, Software, SAP, Business, Infrastructure), heavily augmented by any attached scope documents.
    """
    client = get_openai_client()
    is_sap = is_sap_context(module, topic, meeting_name)

    if not client:
        return _fallback_pre_meeting_prep(topic, industry, module, project_name, meeting_name, is_sap)

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
  "topics": ["Relevant Topic 1", "Relevant Topic 2", "Relevant Topic 3", "Relevant Topic 4"],
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
        
        # Validate that questions exist and are not empty
        if not data.get("recommendedQuestions") or len(data["recommendedQuestions"]) < 3:
            return _fallback_pre_meeting_prep(topic, industry, module, project_name, meeting_name, is_sap)
            
        return data
    except Exception as e:
        print(f"[AI Service Error in Pre-Meeting Prep]: {e}")
        return _fallback_pre_meeting_prep(topic, industry, module, project_name, meeting_name, is_sap)

def _fallback_pre_meeting_prep(topic, industry, module, project_name, meeting_name, is_sap=False):
    """Rich, dynamic fallback generator supporting both SAP and Non-SAP/AI/Tech meetings."""
    combined = f" {module} {topic} {meeting_name} ".upper()
    is_ai = any(k in combined for k in ['AI', 'ML', 'MODEL', 'LLM', 'GPT', 'INTELLIGENCE', 'ALGORITHM', 'DATA SCIENCE', 'VISION', 'NLP'])

    if is_sap:
        module_questions = {
            'MM': [
                ("What is the approval escalation hierarchy when a Purchase Requisition approver exceeds the SLA window?", "Approval Workflow", "Critical"),
                ("Should vendor evaluation scoring criteria differ between strategic contracts and one-time purchases?", "Vendor Management", "Critical"),
                ("How are material valuation classes mapped across multiple manufacturing plants and storage locations?", "Material Valuation", "High"),
                ("Are blanket purchase orders required for recurring raw material procurement with release orders?", "Purchasing", "High"),
                ("What tolerance limits and price variance thresholds are configured for automated 3-way invoice matching?", "Invoice Verification", "Medium"),
                ("How will batch management and expiration date tracking be integrated with incoming goods inspection?", "Inventory Management", "Medium")
            ],
            'FI': [
                ("What is the foreign currency revaluation methodology for open AR/AP line items at period-end?", "General Ledger", "Critical"),
                ("How are electronic bank statements (EBS) and BAI2 auto-clearing rules configured for high-volume transactions?", "Treasury & Bank", "Critical"),
                ("What is the intercompany reconciliation frequency and cross-company code document posting setup?", "Intercompany", "High"),
                ("How will withholding tax (TDS / WHT) certificates be automatically calculated and dispatched to vendors?", "Accounts Payable", "High"),
                ("What depreciation keys and asset capitalization thresholds apply to capital work-in-progress (CWIP)?", "Asset Accounting", "Medium")
            ],
            'SD': [
                ("What pricing condition techniques and access sequences apply to distributor tiered volume discounts?", "Pricing & Conditions", "Critical"),
                ("How should credit limit checks handle orders with unbilled deliveries versus pending billing documents?", "Credit Management", "Critical"),
                ("What ATP (Available to Promise) checking rules govern rush orders versus scheduled backorders?", "Order Fulfillment", "High"),
                ("How will intercompany billing and transfer pricing be automated across distribution hubs?", "Billing & Invoicing", "High"),
                ("What customer return and non-conformance approval workflows route credit memo requests?", "Returns Management", "Medium")
            ],
            'PP': [
                ("What MRP run scheduling frequency and planning strategies (Make-to-Stock vs Make-to-Order) are configured?", "MRP & Planning", "Critical"),
                ("How are backflushing and yield confirmations handled on the shop floor?", "Shop Floor Control", "Critical"),
                ("How is capacity leveling executed for bottleneck work centers during peak seasonal demands?", "Capacity Planning", "High"),
                ("What scrap allowance percentages and phantom assembly BOMs are maintained in master recipes?", "BOM & Routing", "High"),
                ("How are production order variance calculations and settlement rules posted to cost centers?", "Costing & Settlement", "Medium")
            ],
            'QM': [
                ("What are the sampling procedures and dynamic modification rules for incoming raw material inspection?", "Goods Receipt Inspection", "Critical"),
                ("How are Certificate of Analysis (CoA) validation rules enforced before release of batch to unrestricted stock?", "Batch Release", "Critical"),
                ("What non-conformance notification workflow routes customer returns to quality engineering audit?", "Quality Notifications", "High"),
                ("How are recurring calibration intervals and test equipment tracking managed for lab instruments?", "Calibration Management", "High"),
                ("What recurring audit checklist templates are maintained for ISO compliance and vendor audits?", "Quality Audits", "Medium")
            ]
        }
        q_list = module_questions.get(module.upper(), module_questions['MM'])
    elif is_ai:
        q_list = [
            (f"What foundational model architecture, embedding strategy, or fine-tuning approach will be utilized for '{meeting_name}'?", "Model Architecture", "Critical"),
            (f"What training/fine-tuning datasets, data cleansing pipelines, and ground-truth validation sets are required?", "Data Pipeline & Quality", "Critical"),
            (f"What are the target inference latency (p95/p99), token consumption budgets, and throughput thresholds for production?", "Performance & Scalability", "High"),
            (f"How will prompt safety guardrails, hallucination prevention mechanisms, and sensitive data redaction (PII) be enforced?", "Safety & Guardrails", "High"),
            (f"What automated evaluation metrics (e.g., RAG precision, BLEU, human-in-the-loop review) will determine model promotion to production?", "Evaluation & Benchmarks", "High"),
            (f"What REST/gRPC API contracts and asynchronous event streaming are needed to integrate the AI capabilities with core client systems?", "Integration & Deployment", "Medium")
        ]
    else:
        q_list = [
            (f"What are the core technical deliverables, milestone deadlines, and success metrics defined for '{meeting_name}'?", "Goals & Architecture", "Critical"),
            (f"What latency, throughput, and scalability benchmarks must be satisfied for this project implementation?", "Performance & Scale", "Critical"),
            (f"How will data security, access control, and compliance requirements be enforced across development and production environments?", "Security & Governance", "High"),
            (f"What are the critical upstream and downstream integration dependencies with existing systems?", "Integration & APIs", "High"),
            (f"What automated test suites, end-to-end validation scenarios, and rollback strategies are planned for deployment?", "Quality & Testing", "High"),
            (f"What is the timeline, milestone schedule, and ownership assignment for immediate next action items?", "Execution Roadmap", "Medium")
        ]

    recommended = []
    for idx, (q_text, q_topic, priority) in enumerate(q_list, start=1):
        recommended.append({
            "id": f"rq-{idx}",
            "priority": priority,
            "module": module,
            "topic": q_topic,
            "question": q_text,
            "reasons": [
                f"Essential for project alignment and operational success in {industry}",
                f"Mitigates technical risk and prevents delivery bottlenecks for '{meeting_name}'"
            ],
            "source": "Project Best Practices & Domain Knowledge",
            "confidence": 96 - (idx * 2)
        })

    return {
        "project": project_name,
        "meetingName": meeting_name,
        "date": "Upcoming Session",
        "time": "Scheduled",
        "moduleLabel": f"{module} / {topic}",
        "objective": f"Review key requirements, architecture, and operational alignment for '{meeting_name}' in {industry}.",
        "participants": [
            {"name": "Project Lead", "role": "Lead Architect" if is_sap else "Technical Lead"},
            {"name": "Domain Stakeholder", "role": f"{module if is_sap else industry} Process Owner"}
        ],
        "topics": (
            ["Master Data", "Process Flow", "Integration Touchpoints", "Compliance & Reporting"]
            if is_sap else
            ["Model & Architecture", "Data Pipeline", "API Integration", "Evaluation & Testing"]
            if is_ai else
            ["Architecture & Scope", "Integration & APIs", "Performance & Security", "Milestones & Delivery"]
        ),
        "readiness": {
            "overall": 92,
            "projectKnowledge": 95,
            "openRequirements": 88,
            "questionCoverage": 90
        },
        "recommendedQuestions": recommended,
        "alreadyCovered": (
            [
                "Baseline organizational structure defined",
                "Chart of accounts agreed"
            ] if is_sap else [
                "Baseline project objectives established",
                "Core system architecture and operational scope reviewed"
            ]
        )
    }

def analyze_post_meeting_transcript(
    transcript: str,
    topic: str = "Meeting Workshop",
    module: str = "Cross-Module",
    industry: str = "General",
    document_context: str = ""
):
    """
    Pathway 4: Post-Meeting Intelligence.
    Extracts questions asked & answered, critical missed questions (domain gaps), decisions, risks, and action items.
    Augmented by attached scope documents to identify scope gaps and unaddressed requirements.
    """
    client = get_openai_client()
    is_sap = is_sap_context(module, topic, topic)

    if not client or not transcript or len(transcript.strip()) < 10:
        return _fallback_post_meeting_analysis(topic, module, industry, is_sap)

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
        print(f"[AI Post-Meeting Analysis Error]: {e}")
        return _fallback_post_meeting_analysis(topic, module, industry, is_sap)

def _fallback_post_meeting_analysis(topic, module, industry, is_sap=False):
    if is_sap:
        return {
            "project": f"SAP {industry} Implementation",
            "meetingName": topic,
            "date": "Completed Session",
            "summary": {
                "questionsIdentified": 12,
                "asked": 9,
                "answered": 8,
                "partial": 1,
                "missed": 3,
                "newRequirements": 3,
                "decisions": 2,
                "risks": 1
            },
            "questionsAsked": [
                {"question": f"What triggers a purchase requisition to require Finance Head approval in {module}?", "status": "Answered"},
                {"question": "How are duplicate vendor records identified during onboarding?", "status": "Answered"},
                {"question": "What is the tolerance limit for goods receipt quantity variance?", "status": "Partially Answered"}
            ],
            "missedQuestions": [
                {
                    "question": "What is the escalation process for approval exceptions and SLA breaches?",
                    "priority": "Critical",
                    "confidence": 94
                },
                {
                    "question": "How should emergency purchases bypass the standard multi-level approval chain?",
                    "priority": "High",
                    "confidence": 88
                },
                {
                    "question": "What automated background reconciliation jobs are scheduled for open line items?",
                    "priority": "High",
                    "confidence": 85
                }
            ],
            "newRequirements": [
                {"id": "REQ-031", "text": "Vendor evaluation must support tiered scoring for strategic suppliers."},
                {"id": "REQ-032", "text": "System must flag purchase requisitions exceeding budget threshold automatically."},
                {"id": "REQ-033", "text": "Goods receipt tolerance must be configurable per material group."}
            ],
            "decisions": [
                {"text": "Two-level approval will be implemented for purchase orders above threshold.", "module": module},
                {"text": "Vendor master will use a single client-wide numbering range.", "module": module}
            ],
            "risks": [
                {"text": "Approval escalation ownership has not been assigned on the client side.", "severity": "High"}
            ],
            "followUpActions": [
                "Schedule follow-up on approval escalation matrix with Client Procurement Head",
                "Confirm budget threshold values and tolerance keys with Finance"
            ]
        }
    else:
        return {
            "project": f"{industry} Technology Engagement",
            "meetingName": topic,
            "date": "Completed Session",
            "summary": {
                "questionsIdentified": 10,
                "asked": 7,
                "answered": 6,
                "partial": 1,
                "missed": 3,
                "newRequirements": 3,
                "decisions": 3,
                "risks": 2
            },
            "questionsAsked": [
                {"question": f"What are the core technical deliverables and architectural boundaries for {topic}?", "status": "Answered"},
                {"question": "What latency and response time targets must be guaranteed under production load?", "status": "Answered"},
                {"question": "What authentication and token expiration policies govern the external API gateways?", "status": "Answered"}
            ],
            "missedQuestions": [
                {
                    "question": "What are the automated failover and disaster recovery protocols if the primary service degrades?",
                    "priority": "Critical",
                    "confidence": 94
                },
                {
                    "question": "How will schema migrations and backward-incompatible API changes be versioned?",
                    "priority": "High",
                    "confidence": 89
                },
                {
                    "question": "What data retention, audit logging, and compliance masking rules are mandated for user interactions?",
                    "priority": "High",
                    "confidence": 86
                }
            ],
            "newRequirements": [
                {"id": "REQ-01", "text": f"System must support asynchronous job queues for long-running {topic} tasks."},
                {"id": "REQ-02", "text": "All API endpoints must enforce rate-limiting and structured error schemas."},
                {"id": "REQ-03", "text": "Audit trails must capture user identity and timestamp for all configuration changes."}
            ],
            "decisions": [
                {"text": f"Architecture will adopt modular service boundaries for {topic}.", "module": module},
                {"text": "OpenAI GPT-4o will be utilized with structured JSON response formats for AI intelligence.", "module": module}
            ],
            "risks": [
                {"text": "Downstream third-party API rate limits could cause intermittent latency spikes.", "severity": "High"},
                {"text": "Legacy data migration lacks automated validation scripts.", "severity": "Medium"}
            ],
            "followUpActions": [
                f"Draft formal technical specification document for {topic} architecture",
                "Set up staging environment and automated end-to-end integration tests"
            ]
        }

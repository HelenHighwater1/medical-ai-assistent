# Prepare for Your Next Appointment

**A demo project by Helen Highwater - built as an application supplement for Citizen Health**

> Citizen Health has no affiliation with or knowledge of this project. It was built independently as a demonstration of interest in their mission.

---

> ⚠️ **This is NOT a product of Citizen Health.** This is an independent demo project built as part of a job application. It is **not HIPAA compliant**, does not store or protect patient data, and is **not safe to use with real medical information**. The sample documents included are entirely fictional.

---

## Why I Built This

I am passionate about Citizen Health's mission - and that passion is personal.

My mom had ALS.  I remember seeing the PDFs and information she was given.  The documents were overwhelming, not just because of the technical details and acronyms, and stuff like that, but also because each page had an emotional weight. We were just trying to understand what was happening to someone we loved.  

That experience is why Citizen Health resonates with me in a way that goes beyond a job listing. 

This app is to suppliment an application to join your SWE team. It takes a clinical document and translates it into something a frightened person can actually absorb- one piece at a time, in plain language, with warmth. It ends with a list of specific questions to bring to the next appointment, because that's what we always needed and never had.

I am applying to Citizen Health specifically because I want to spend my career building technology that matters to people in the hardest moments of their lives. This is just a toy demo - Citizen Health is the real deal, and I want to be part of it.

---

## What It Does

Upload a clinical document - a diagnosis report, a specialist letter, a genetic result - and the app breaks it down into five staged cards delivered one at a time, like text messages arriving, so the information doesn't hit all at once:

1. **What this document is** - orienting context so you know what you're looking at
2. **The main finding** - the diagnosis or key result, delivered with emotional acknowledgment before clinical explanation
3. **What the tests showed** - the evidence, in plain language, without jargon
4. **What happens next** - medications, referrals, follow-up appointments - actionable and forward-looking
5. **Questions to bring to your appointment** - four specific questions drawn from the actual details in your document, not generic advice

After the cards, the patient can ask follow-up questions in a conversational chat. Every response is paced, warm, and grounded in the document rather than general AI knowledge.

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router) with React and TypeScript
- Tailwind CSS for styling
- Framer Motion for the staged card reveal animations
- Client and server components with careful state management across the upload → extract → summarize → chat flow

**Backend / API**
- Next.js API routes as a secure server-side proxy for all Anthropic API calls - the API key is never exposed to the client
- Anthropic Claude API with structured JSON responses for the card summaries and streaming for the follow-up chat
- Server-side PDF text extraction and EML email parsing with MIME header stripping and HTML sanitization

**Prompt Engineering**
- Two distinct prompt layers: a structured card prompt that returns validated JSON, and a conversational chat prompt with a full system persona
- Emotional distress detection via client-side keyword matching before API calls, with compassionate response handling
- Hard safety rules baked into every prompt: no survival statistics without full context, no definitive medical claims, no passive voice, every response grounded in document content rather than general knowledge
- Confidence signals appended to every AI response reminding the patient to verify with their doctor

**Document Handling**
- PDF upload with text extraction via pdf-parse
- EML email parsing with mailparser to strip MIME headers and extract clean readable body text
- Document validation before API submission - key term matching to catch silent extraction failures before hallucinated content reaches the patient
- Three fictional sample documents included: an ALS clinical consultation report, a CTNNB1 pediatric genetic diagnosis, and an ALS specialist follow-up email

**Accessibility**
- Semantic HTML throughout
- ARIA labels and roles on all interactive elements
- Keyboard navigation and focus trapping
- Screen reader compatible card reveal sequence

**Design**
- UI inspired by Citizen Health's own design language - indigo palette, warm typography, generous whitespace
- Staged card reveal that respects the emotional weight of receiving serious medical news
- "Prepare for your appointment" framing throughout, giving the patient agency rather than positioning them as a passive recipient

---

## Known Limitations - Please Read

This app is a technical demonstration. I want to be honest about what it is not, because the subject matter demands it.

**It is not HIPAA compliant.** There is no BAA with Anthropic, no PHI encryption at rest, no audit logging, no access controls. Real patient data should never be entered.

**It is not clinically validated.** The summaries are generated by a general-purpose language model. It has no connection to verified clinical sources and no mechanism for knowing when it is uncertain. During development I discovered the model can hallucinate entirely fabricated diagnoses, physician names, and medications when document extraction fails silently - which is exactly the kind of failure mode that would be dangerous in a real clinical context.

**It is not emotionally safe for unsupported use.** There is no crisis detection beyond basic keyword matching, no escalation to human support, and no clinician in the loop. A patient in acute distress receiving a terminal diagnosis summary from an AI alone is a real harm vector.

**A real version would need:**
- A BAA with the AI provider and HIPAA-compliant infrastructure throughout
- Retrieval-augmented generation (RAG) grounded in verified clinical sources
- Structured output validation to catch hallucinations before they reach the patient
- Clinical review and governance over model behavior
- Real crisis detection and escalation to human support
- Robust accessibility and localization for diverse patient populations

The distance between this demo and something safe enough to put in front of a real patient is large. I know that. I built this to show I understand the problem - technically and humanly - and because I want to help close that distance.

---

## Sample Documents

All three sample documents are entirely fictional and contain no real patient information. They were created to demonstrate the range of document types the app handles and the emotional variety of the use case.

| Document | Type | Clinical Context |
|----------|------|-----------------|
| ALS Clinical Consultation Report | PDF | Early-to-mid stage ALS diagnosis - adult patient, multidisciplinary workup including EMG, MRI, pulmonary function tests, genetic panel, and ALSFRS-R functional scoring |
| CTNNB1 Genetic Diagnosis Report | PDF | Pediatric rare disease - whole exome sequencing result delivered to parents of a 3-year-old with a confirmed de novo CTNNB1 pathogenic variant |
| ALS Specialist Follow-up Email | EML | Doctor's follow-up email to a recently diagnosed ALS patient - technical but personal, explaining findings and next steps in writing |

---

## Disclaimer

This project is a technical demonstration only. It is:

- **Not a product of Citizen Health** - built independently by Helen Highwater as a job application supplement
- **Not HIPAA compliant** - no data encryption, no access controls, no audit logging
- **Not safe for real patient data** - all input is sent to a third-party AI API without a BAA
- **Not a substitute for medical advice** - every response includes a reminder to verify with your care team
- **Not affiliated with Citizen Health in any way** - Citizen Health has no knowledge of or responsibility for this project

All sample medical documents are fictional and contain no real patient information.

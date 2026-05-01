import os
import sys
import faiss
import numpy as np
from django.conf import settings
from .models import DoctorEmbeddingModel


_embedding_model = None
_gemini_model = None


def is_testing():
    return (
        "pytest" in sys.modules
        or os.environ.get("PYTEST_CURRENT_TEST")
        or os.environ.get("TESTING") == "1"
    )


def get_embedding_model():
    global _embedding_model

    if is_testing():
        return None

    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    return _embedding_model


def get_gemini_model():
    """Try google.generativeai (installed). Returns None if unavailable."""
    global _gemini_model

    if is_testing():
        return None

    if _gemini_model is None:
        try:
            import warnings
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                import google.generativeai as genai

            api_key = getattr(settings, "GOOGLE_API_KEY", None)
            if not api_key:
                return None

            genai.configure(api_key=api_key)
            _gemini_model = genai.GenerativeModel("gemini-2.0-flash-lite")
        except Exception:
            _gemini_model = None

    return _gemini_model


# ====================================================
# SMART RULE-BASED FALLBACK (100% Free, No API Key)
# ====================================================
MEDICAL_KB = {
    "fever|জ্বর|তাপমাত্রা": {
        "advice": "জ্বরের জন্য প্রচুর পানি পান করুন, বিশ্রাম নিন এবং প্যারাসিটামল নিতে পারেন। ১০৩°F-এর বেশি হলে অবিলম্বে ডাক্তার দেখান।",
        "specialist": "General Physician / Internal Medicine",
    },
    "chest pain|বুকে ব্যথা|হার্ট": {
        "advice": "বুকে ব্যথা গুরুতর লক্ষণ। অবিলম্বে হাসপাতালে যান। শ্বাসকষ্ট থাকলে ৯৯৯ কল করুন।",
        "specialist": "Cardiologist (হৃদরোগ বিশেষজ্ঞ)",
    },
    "headache|মাথাব্যথা|মাথা ঘুরা": {
        "advice": "বিশ্রাম নিন, পানি পান করুন। মাথাব্যথা তীব্র বা ঘন ঘন হলে ডাক্তারের পরামর্শ নিন।",
        "specialist": "Neurologist (স্নায়ু বিশেষজ্ঞ)",
    },
    "diabetes|ডায়াবেটিস|blood sugar|রক্তে শর্করা": {
        "advice": "নিয়মিত ব্লাড সুগার পরীক্ষা করুন, মিষ্টি ও কার্বোহাইড্রেট কমান, নিয়মিত হাঁটুন।",
        "specialist": "Endocrinologist / Diabetologist",
    },
    "cough|কাশি|সর্দি|cold": {
        "advice": "গরম পানি ও লেবু পান করুন, বিশ্রাম নিন। ১ সপ্তাহের বেশি থাকলে বা রক্ত আসলে ডাক্তার দেখান।",
        "specialist": "General Physician / Pulmonologist",
    },
    "stomach|পেট ব্যথা|বমি|vomiting|diarrhea|ডায়রিয়া": {
        "advice": "স্যালাইন পান করুন, হালকা খাবার খান। ডিহাইড্রেশন হলে বা রক্ত দেখলে অবিলম্বে ডাক্তার দেখান।",
        "specialist": "Gastroenterologist (পেট বিশেষজ্ঞ)",
    },
    "skin|ত্বক|rash|চুলকানি|itching|eczema": {
        "advice": "প্রভাবিত স্থান পরিষ্কার রাখুন। অ্যান্টিহিস্টামিন ক্রিম ব্যবহার করা যেতে পারে। তীব্র হলে ডার্মাটোলজিস্ট দেখান।",
        "specialist": "Dermatologist (ত্বক বিশেষজ্ঞ)",
    },
    "eye|চোখ|দৃষ্টি|vision": {
        "advice": "চোখ ঘষবেন না। পরিষ্কার পানি দিয়ে ধুতে পারেন। দৃষ্টিশক্তি পরিবর্তন হলে অবিলম্বে চক্ষু বিশেষজ্ঞ দেখান।",
        "specialist": "Ophthalmologist (চক্ষু বিশেষজ্ঞ)",
    },
    "bone|হাড়|joint|গাঁটে ব্যথা|arthritis|back pain|পিঠে ব্যথা": {
        "advice": "বিশ্রাম নিন, বরফ লাগান। দীর্ঘমেয়াদী ব্যথায় অর্থোপেডিক বিশেষজ্ঞ দেখান।",
        "specialist": "Orthopedist (অস্থি বিশেষজ্ঞ)",
    },
    "anxiety|depression|মানসিক|mental|stress|ঘুম": {
        "advice": "মেডিটেশন ও ব্যায়াম সাহায্য করে। কথা বলুন প্রিয়জনের সাথে। গুরুতর হলে মনোরোগ বিশেষজ্ঞের পরামর্শ নিন।",
        "specialist": "Psychiatrist / Psychologist (মানসিক স্বাস্থ্য বিশেষজ্ঞ)",
    },
    "pregnancy|গর্ভাবস্থা|period|মাসিক|gynecology": {
        "advice": "নিয়মিত স্বাস্থ্য পরীক্ষা করুন। গর্ভাবস্থায় ফলিক অ্যাসিড ও আয়রন সাপ্লিমেন্ট নিন।",
        "specialist": "Gynecologist / Obstetrician",
    },
    "child|শিশু|baby|বাচ্চা|pediatric": {
        "advice": "শিশুর টিকা নিশ্চিত করুন। জ্বর বা অস্বাভাবিক আচরণে শিশু বিশেষজ্ঞ দেখান।",
        "specialist": "Pediatrician (শিশু বিশেষজ্ঞ)",
    },
    "blood pressure|উচ্চ রক্তচাপ|hypertension": {
        "advice": "লবণ কম খান, নিয়মিত ব্যায়াম করুন। নিয়মিত BP মনিটর করুন এবং ডাক্তারের পরামর্শ মেনে চলুন।",
        "specialist": "Cardiologist / Internal Medicine",
    },
}

GREETINGS = {"hello", "hi", "হ্যালো", "হেলো", "assalamu", "আস্সালামু", "salam", "নমস্কার"}


def rule_based_response(query: str) -> str:
    """Smart rule-based medical assistant — 100% free, no API needed."""
    query_lower = query.lower().strip()

    # Greeting
    if any(g in query_lower for g in GREETINGS):
        return (
            "আস্সালামু আলাইকুম! 👋 আমি আপনার **Smart Hospital AI Doctor Assistant**।\n\n"
            "আমি আপনাকে প্রাথমিক স্বাস্থ্য পরামর্শ এবং সঠিক ডাক্তার খুঁজে পেতে সাহায্য করতে পারি।\n\n"
            "**কিভাবে সাহায্য করতে পারি?**\n"
            "• আপনার সমস্যার কথা লিখুন (যেমন: জ্বর, মাথাব্যথা, পেট ব্যথা)\n"
            "• অথবা কোনো নির্দিষ্ট বিশেষজ্ঞের খোঁজ করুন\n\n"
            "আপনার লক্ষণগুলো নিচে লিখুন। 👇"
        )

    # Match knowledge base
    matched_info = None
    for keywords, info in MEDICAL_KB.items():
        if any(kw in query_lower for kw in keywords.split("|")):
            matched_info = info
            break

    if matched_info:
        # Fetch relevant doctors from DB based on specialist type
        from .models import DoctorEmbeddingModel
        specialist_keywords = matched_info['specialist'].split(" / ")
        
        # Try to find doctors whose speciality matches any of the specialist keywords
        relevant_docs = []
        all_active_docs = DoctorEmbeddingModel.objects.filter(is_active=True)
        
        for doc in all_active_docs:
            content_lower = doc.content.lower()
            if any(skw.lower() in content_lower for skw in specialist_keywords):
                relevant_docs.append(doc)
        
        # If no specific match, take a few real doctors (not admin)
        if not relevant_docs:
            relevant_docs = list(all_active_docs.filter(doctor__user__role='DOCTOR').exclude(doctor__user__username='admin')[:2])
        else:
            relevant_docs = relevant_docs[:3]

        doc_list = []
        for d in relevant_docs:
            lines = d.content.splitlines()
            name = lines[0].replace("Doctor: ", "")
            # Skip if name is just 'admin' to look more professional
            if name.lower() == 'admin':
                continue
            
            spec = lines[1].replace("Speciality: ", "")
            doc_list.append(f"👨‍⚕️ **{name}**\n   _{spec}_")
        
        doc_list_str = "\n".join(doc_list)

        res = (
            f"### 🩺 স্বাস্থ্য পরামর্শ\n"
            f"{matched_info['advice']}\n\n"
            f"### 👨‍⚕️ বিশেষজ্ঞের ধরন\n"
            f"আপনার এই সমস্যার জন্য **{matched_info['specialist']}** দেখানো উচিত।\n\n"
        )
        
        if doc_list:
            res += f"### 🏥 আমাদের সুপারিশকৃত ডাক্তার:\n{doc_list_str}\n\n"
        
        res += (
            "--- \n"
            "⚠️ **সতর্কবার্তা:** এই তথ্যটি শুধুমাত্র সাধারণ নির্দেশনার জন্য। "
            "গুরুতর সমস্যায় অবিলম্বে নিকটস্থ হাসপাতালে যোগাযোগ করুন অথবা আমাদের অ্যাপয়েন্টমেন্ট সেকশন থেকে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন।"
        )
        return res

    # Generic response if no match found
    from .models import DoctorEmbeddingModel
    general_docs = DoctorEmbeddingModel.objects.filter(is_active=True, doctor__user__role='DOCTOR').exclude(doctor__user__username='admin')[:2]

    doc_list = []
    for d in general_docs:
        lines = d.content.splitlines()
        name = lines[0].replace("Doctor: ", "")
        spec = lines[1].replace("Speciality: ", "")
        doc_list.append(f"• **{name}** ({spec})")
    doc_list_str = "\n".join(doc_list)

    res = (
        f"### 🔍 আপনার প্রশ্ন: \"{query}\"\n\n"
        "দুঃখিত, আমি এই বিষয়ে সুনির্দিষ্ট পরামর্শ দিতে পারছি না। তবে সাধারণত এই ক্ষেত্রে করণীয়:\n"
        "• পর্যাপ্ত বিশ্রাম নিন এবং প্রচুর পানি পান করুন।\n"
        "• যদি ব্যথা বা অস্বস্তি বাড়ে, তবে দ্রুত আমাদের জেনারেল ফিজিশিয়ান দেখান।\n\n"
    )
    
    if doc_list:
        res += f"### 🏥 আমাদের ডাক্তাররা আপনার পাশে আছেন:\n{doc_list_str}\n\n"
    
    res += (
        "🔗 আপনি আমাদের **Dashboard** থেকে সরাসরি অ্যাপয়েন্টমেন্ট বুক করতে পারেন।\n\n"
        "⚠️ *AI পরামর্শ পেশাদার চিকিৎসার বিকল্প নয়।*"
    )
    return res


class RAGService:

    @staticmethod
    def generate_embeddings_for_all_doctors():
        model = get_embedding_model()
        if model is None:
            return "Skipped in test mode"

        doctors = DoctorEmbeddingModel.objects.filter(is_active=True)
        count = 0
        for item in doctors:
            vector = model.encode(item.content)
            item.embedding_vector = vector.tolist()
            item.save(update_fields=["embedding_vector"])
            count += 1
        return f"{count} embeddings updated"

    @staticmethod
    def build_faiss_index():
        items = list(DoctorEmbeddingModel.objects.filter(is_active=True, embedding_vector__isnull=False))
        if not items:
            return None, []
        vectors = np.array([i.embedding_vector for i in items], dtype="float32")
        index = faiss.IndexFlatL2(vectors.shape[1])
        index.add(vectors)
        return index, items

    @staticmethod
    def retrieve_relevant_doctors(query, top_k=3):
        model = get_embedding_model()
        if model is None:
            return []
        index, items = RAGService.build_faiss_index()
        if index is None:
            return []
        q_vec = model.encode([query]).astype("float32")
        _, indices = index.search(q_vec, top_k)
        results = []
        for i in indices[0]:
            if i == -1:
                continue
            results.append(items[i].content)
        return results

    @staticmethod
    def sync_doctor_data():
        """Sync actual doctor profiles and schedules into Embedding model."""
        from accounts.models import DoctorProfileModel
        from doctorsapp.models import DoctorAvailabilityModel
        
        doctors = DoctorProfileModel.objects.filter(user__role='DOCTOR').exclude(user__username='admin')
        count = 0
        for doc in doctors:
            availabilities = DoctorAvailabilityModel.objects.filter(doctor=doc, is_active=True)
            schedule = ", ".join([f"{a.day} ({a.start_time.strftime('%H:%M')}-{a.end_time.strftime('%H:%M')})" for a in availabilities])
            
            content = f"Doctor: {doc.user.get_full_name() or doc.user.username}\n"
            content += f"Speciality: {doc.speciality or 'General Medicine'}\n"
            content += f"Qualification: {doc.qualification or 'MBBS'}\n"
            content += f"Hospital: {doc.hospital_name or 'Smart Hospital'}\n"
            content += f"Experience: {doc.experience or 0} years\n"
            content += f"Schedule: {schedule if schedule else 'Contact hospital for schedule'}"
            
            DoctorEmbeddingModel.objects.update_or_create(
                doctor=doc,
                defaults={'content': content, 'is_active': True}
            )
            count += 1
        
        # Then regenerate embeddings if model is available
        try:
            RAGService.generate_embeddings_for_all_doctors()
        except Exception:
            pass
            
        return f"Synced {count} doctors."

    @staticmethod
    def ask_ai(query):
        """
        1. Try Gemini API (if available)
        2. Fall back to RAG + rule-based (always free)
        """
        gemini = get_gemini_model()
        if gemini:
            try:
                # 1. Try to get relevant doctors
                docs = RAGService.retrieve_relevant_doctors(query)
                
                # 2. If no relevant doctors found, fetch some general doctors (not admin) to provide context
                if not docs:
                    from .models import DoctorEmbeddingModel
                    fallback_docs = DoctorEmbeddingModel.objects.filter(is_active=True, doctor__user__role='DOCTOR').exclude(doctor__user__username='admin')[:2]
                    docs = [d.content for d in fallback_docs]

                context = "\n\n---\n\n".join(docs) if docs else "No specific doctor data found currently. Please consult our staff."
                
                prompt = f"""You are a professional, empathetic medical assistant for 'Smart Hospital'. 
Your goal is to provide helpful preliminary health advice and recommend specific doctors from our hospital.

Context (Available Doctors and their details):
{context}

Patient's Message: {query}

Instructions:
1. Provide a warm, professional, and empathetic response in the language the patient used (Bangla or English).
2. Give clear medical advice (e.g., rest, hydration, specific signs to watch for).
3. Recommend the most suitable doctors from the provided context. 
   - STRICT RULE: NEVER suggest a doctor named 'admin'. 
   - Use the doctor's full name and speciality if available.
4. If no specific doctor matches the condition perfectly, recommend our general physicians or specialists from the context.
5. Use professional Markdown: '###' for headers, bold text for emphasis, and relevant emojis (🩺, 👨‍⚕️, 🏥, ⚠️).
6. Keep the tone dynamic and helpful, not robotic or static.
7. Always end with a disclaimer: "⚠️ This is AI-generated guidance and not a substitute for professional medical advice."

Answer:"""
                response = gemini.generate_content(prompt)
                return response.text
            except Exception:
                pass

        # Always-available fallback
        return rule_based_response(query)
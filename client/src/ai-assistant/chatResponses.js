export const QUICK_REPLIES = [
  'I have a headache',
  'How do I book an appointment?',
  'What are emergency numbers?',
  'Which doctor should I see?',
  'I have chest pain',
  'Tell me about diabetes',
];

const RESPONSES = [
  /* ── Greetings ── */
  {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola'],
    response: `Hello! I'm **Aarohi**, your AI health assistant on MediChain. 👋\n\nI can help you with:\n• Symptom guidance and health tips\n• Finding the right specialist\n• Appointment booking help\n• Healthcare FAQs and emergency info\n\nWhat can I help you with today?`,
    suggestions: ['I feel unwell', 'Find a doctor', 'Emergency help', 'Health tips'],
  },

  /* ── Emergency ── */
  {
    patterns: ['emergency', 'ambulance', 'urgent', 'dying', '108', '102', 'critical', 'severe bleeding', 'unconscious', 'not breathing'],
    response: `🚨 **EMERGENCY — Call immediately:**\n\n• **108** — Ambulance (India National)\n• **102** — Ambulance (alternate)\n• **100** — Police\n• **101** — Fire\n• **1066** — Disaster Management\n\n⚠️ **While waiting for help:**\n1. Keep the patient calm and still\n2. Do not give food or water\n3. Apply pressure to any bleeding wounds\n4. If unconscious but breathing — recovery position\n5. If not breathing — begin CPR if trained\n\nGo to our [Emergency Page](/emergency) for blood banks and NGO contacts.`,
    suggestions: ['CPR guide', 'Nearest hospital', 'Blood bank'],
  },

  /* ── Chest pain ── */
  {
    patterns: ['chest pain', 'heart attack', 'cardiac', 'pressure in chest', 'chest tightness', 'palpitation'],
    response: `🚨 **Chest pain can be serious — seek help immediately.**\n\n**Warning signs of a heart attack:**\n• Crushing pressure or tightness in chest\n• Pain spreading to arm, jaw, or back\n• Shortness of breath\n• Cold sweats + nausea\n• Lightheadedness\n\n**If you suspect a heart attack:**\n1. Call **108** immediately\n2. Chew one aspirin (if not allergic)\n3. Sit or lie down — stay calm\n4. Loosen tight clothing\n5. Do not drive yourself\n\n⚠️ Do NOT ignore chest pain. See a **Cardiologist** urgently.\n\n*This is not a substitute for medical advice.*`,
    suggestions: ['Find Cardiologist', 'Emergency numbers', 'Heart attack symptoms'],
  },

  /* ── Fever ── */
  {
    patterns: ['fever', 'temperature', 'chills', 'shivering', 'hot', 'feverish'],
    response: `🌡️ **Managing Fever:**\n\n**Normal body temp:** 36.5°C – 37.5°C (97.7°F – 99.5°F)\n\n**What to do:**\n• Rest and stay well hydrated (water, ORS, coconut water)\n• Take **paracetamol** (500mg–1g) if temp > 38.5°C\n• Wear light clothing — avoid heavy blankets\n• Cool compress on forehead\n\n**See a doctor immediately if:**\n• Fever > 39.5°C (103.1°F) or lasts > 3 days\n• Fever with rash, stiff neck, or confusion\n• Children under 3 months with any fever\n• Fever with severe headache or light sensitivity\n\n**Possible causes:** Viral infection, flu, dengue, malaria, COVID-19, UTI\n\nBook with a **General Physician** or **Pediatrician** (for children).`,
    suggestions: ['Book doctor', 'Find General Physician', 'COVID symptoms'],
  },

  /* ── Headache / Migraine ── */
  {
    patterns: ['headache', 'migraine', 'head pain', 'head ache', 'throbbing head'],
    response: `🧠 **Headache Relief Guide:**\n\n**Common types:**\n• **Tension headache** — band around head, stress-related\n• **Migraine** — throbbing on one side, with light/noise sensitivity\n• **Cluster headache** — severe pain around one eye\n• **Sinus headache** — facial pressure + congestion\n\n**Home relief:**\n• Drink water (dehydration is common cause)\n• Rest in a dark, quiet room\n• Cold or warm compress on neck/forehead\n• Paracetamol or ibuprofen for mild cases\n• Avoid screens for 30–60 minutes\n\n**See a doctor if:**\n• Sudden, severe "thunderclap" headache\n• Headache with fever + stiff neck\n• Worsening over days or weeks\n• Headache after head injury\n\nSee a **Neurologist** for chronic migraines.`,
    suggestions: ['Find Neurologist', 'Migraine triggers', 'Book appointment'],
  },

  /* ── Cough / Cold / Flu ── */
  {
    patterns: ['cough', 'cold', 'runny nose', 'flu', 'sneezing', 'sore throat', 'throat pain', 'congestion'],
    response: `🤧 **Cough, Cold & Flu Guide:**\n\n**Home remedies that work:**\n• Steam inhalation (add eucalyptus oil)\n• Honey + ginger + warm water\n• Gargle with warm salt water\n• Turmeric milk before bed\n• Rest — your immune system needs it\n\n**Over-the-counter options:**\n• Antihistamines for runny nose\n• Paracetamol for fever/sore throat\n• Lozenges for throat\n\n**See a doctor if:**\n• Symptoms last > 10 days\n• High fever (> 39°C)\n• Difficulty breathing or wheezing\n• Blood in mucus/phlegm\n• Very young children or elderly\n\nTypically see a **General Physician** for diagnosis.`,
    suggestions: ['Find General Physician', 'Flu vaccine info', 'Immunity tips'],
  },

  /* ── Stomach / Digestion ── */
  {
    patterns: ['stomach', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'stomach ache', 'stomach pain', 'indigestion', 'acidity'],
    response: `🫃 **Digestive Health Guide:**\n\n**For nausea/vomiting:**\n• Sip clear fluids slowly (ORS, coconut water)\n• Ginger tea is effective\n• Avoid solid food until nausea passes\n• BRAT diet: Banana, Rice, Applesauce, Toast\n\n**For acidity/GERD:**\n• Avoid spicy, fatty, acidic foods\n• Don't lie down within 2 hours of eating\n• Antacids (short-term) or omeprazole\n• Elevate head of bed\n\n**For diarrhea:**\n• ORS/electrolytes to prevent dehydration\n• Avoid dairy and spicy food\n• Probiotics can help\n\n**See a doctor if:**\n• Blood in stool or vomit\n• Severe pain (especially if localized)\n• Signs of dehydration\n• Symptoms lasting > 3 days\n\nSee a **Gastroenterologist** for chronic issues.`,
    suggestions: ['Find Gastroenterologist', 'ORS recipe', 'Book appointment'],
  },

  /* ── Back pain ── */
  {
    patterns: ['back pain', 'lower back', 'spine', 'sciatica', 'backache', 'back ache', 'herniated', 'disc'],
    response: `🦴 **Back Pain Guide:**\n\n**Immediate relief:**\n• Apply ice for first 48 hours (reduces inflammation)\n• Then switch to heat therapy\n• Stay gently active — bed rest makes it worse\n• Ibuprofen / naproxen for inflammation\n• Stretch gently: child's pose, knee-to-chest\n\n**Common causes:**\n• Muscle strain or spasm\n• Poor posture (esp. desk workers)\n• Herniated disc\n• Sciatica (nerve compression)\n\n**Red flags — see doctor immediately:**\n• Pain with numbness/tingling in legs\n• Loss of bladder/bowel control\n• Pain after injury/fall\n• Constant pain that wakes you at night\n• Pain with fever\n\nSee an **Orthopedist** or **Neurologist** for chronic back pain.`,
    suggestions: ['Find Orthopedist', 'Posture tips', 'Back exercises'],
  },

  /* ── Diabetes ── */
  {
    patterns: ['diabetes', 'blood sugar', 'sugar level', 'insulin', 'glucose', 'diabetic'],
    response: `💉 **Diabetes Management Guide:**\n\n**Types:**\n• **Type 1** — immune system attacks insulin cells\n• **Type 2** — body resists insulin (most common, lifestyle-linked)\n• **Gestational** — during pregnancy\n\n**Warning signs:**\n• Frequent urination, excessive thirst\n• Unexplained weight loss\n• Blurry vision\n• Slow-healing wounds\n• Frequent infections\n\n**Management tips:**\n• Monitor blood sugar regularly\n• Low-glycemic diet (whole grains, vegetables, lean protein)\n• 30 min daily exercise\n• Take medications as prescribed\n• Regular HbA1c tests (every 3 months)\n• Foot care is critical for diabetics\n\n**Target ranges:**\n• Fasting: 80–130 mg/dL\n• Post-meal: < 180 mg/dL\n\nSee an **Endocrinologist** for diabetes management.`,
    suggestions: ['Find Endocrinologist', 'Diabetic diet tips', 'Blood sugar chart'],
  },

  /* ── Blood pressure ── */
  {
    patterns: ['blood pressure', 'hypertension', 'bp', 'high bp', 'low bp', 'dizziness', 'dizzy'],
    response: `❤️ **Blood Pressure Guide:**\n\n**Readings:**\n• **Normal:** < 120/80 mmHg\n• **Elevated:** 120–129 systolic\n• **High (Stage 1):** 130–139/80–89\n• **High (Stage 2):** ≥140/≥90\n• **Crisis:** > 180/120 — Emergency!\n\n**For HIGH BP:**\n• Reduce sodium intake (< 2g/day)\n• DASH diet (fruits, vegetables, low fat)\n• 30 min aerobic exercise daily\n• Limit alcohol, quit smoking\n• Manage stress (meditation, yoga)\n• Take prescribed medications consistently\n\n**For LOW BP (dizziness/fainting):**\n• Stand up slowly\n• Increase fluid and salt intake\n• Wear compression stockings\n• Eat small, frequent meals\n\nSee a **Cardiologist** for chronic BP issues.`,
    suggestions: ['Find Cardiologist', 'DASH diet', 'Stress management'],
  },

  /* ── Mental health ── */
  {
    patterns: ['anxiety', 'stress', 'depression', 'mental health', 'panic', 'panic attack', 'sad', 'overthinking', 'insomnia', 'sleep', "can't sleep"],
    response: `🧠 **Mental Health Support:**\n\nFirst — it's okay to not be okay. Mental health is as important as physical health.\n\n**For anxiety/stress:**\n• Deep breathing: 4-7-8 technique\n• Progressive muscle relaxation\n• Limit caffeine and screen time before bed\n• Regular exercise releases endorphins\n• Journal your thoughts\n• Talk to someone you trust\n\n**For better sleep:**\n• Consistent sleep schedule\n• Dark, cool, quiet room\n• Avoid screens 1 hour before bed\n• Avoid heavy meals late at night\n• Chamomile tea or warm milk\n\n**For depression:**\n• Connect with friends and family\n• Set small daily goals\n• Regular exercise (proven mood booster)\n• Avoid alcohol (worsens depression)\n\n**Helplines (India):**\n• iCall: **9152987821**\n• Vandrevala Foundation: **1860-2662-345** (24/7)\n• NIMHANS: **080-46110007**\n\nSee a **Psychiatrist** or **Psychologist** for professional support.`,
    suggestions: ['Find Psychiatrist', 'Breathing exercises', 'Sleep hygiene tips'],
  },

  /* ── Skin ── */
  {
    patterns: ['skin', 'rash', 'acne', 'pimple', 'itch', 'itching', 'eczema', 'psoriasis', 'allergy skin'],
    response: `🌿 **Skin Health Guide:**\n\n**For acne:**\n• Wash face twice daily (gentle cleanser)\n• Use non-comedogenic products\n• Avoid touching your face\n• Benzoyl peroxide or salicylic acid products\n• See a dermatologist for severe acne\n\n**For rashes/eczema:**\n• Identify and avoid triggers (soap, detergent, food)\n• Moisturize frequently with fragrance-free cream\n• Cool compress for itching relief\n• Avoid scratching (can cause infection)\n• Antihistamines for allergic reactions\n\n**For psoriasis:**\n• Moisturize regularly\n• Avoid triggers: stress, smoking, alcohol\n• Sunlight (moderate exposure) can help\n\n**See a Dermatologist immediately for:**\n• Rapidly spreading rash with fever\n• Skin turning yellow (jaundice)\n• Suspicious moles or growths\n• Severe allergic reaction (hives + swelling)\n\nSee a **Dermatologist** for skin concerns.`,
    suggestions: ['Find Dermatologist', 'Skin care routine', 'Book appointment'],
  },

  /* ── Booking ── */
  {
    patterns: ['book', 'appointment', 'schedule', 'how to book', 'booking', 'reserve', 'slot'],
    response: `📅 **How to Book an Appointment on MediChain:**\n\n**Step 1:** Go to **Find Doctors** (search page)\n**Step 2:** Search by specialty or doctor name\n**Step 3:** Use filters: Specialty, Experience, Rating\n**Step 4:** Click a doctor card → "View Profile & Book"\n**Step 5:** Select your preferred **date** from the calendar\n**Step 6:** Choose an available **time slot**\n**Step 7:** Confirm — you'll receive a notification!\n\n**Track your appointments:**\nGo to **My Appointments** → view upcoming, past, and cancelled.\n\n**You can also:**\n• Cancel an upcoming appointment\n• Rate your doctor after the visit\n• View appointment status in real-time\n\nNeed help finding a specific specialist?`,
    suggestions: ['Find Cardiologist', 'Find General Physician', 'View my appointments'],
  },

  /* ── Cancel/Reschedule ── */
  {
    patterns: ['cancel', 'reschedule', 'change appointment', 'cancel appointment', 'modify'],
    response: `🔄 **Cancelling or Rescheduling:**\n\n**To cancel an appointment:**\n1. Go to **My Appointments**\n2. Find the appointment\n3. Click **Cancel** on upcoming appointments\n\n**To reschedule:**\nCurrently, to reschedule, cancel the existing appointment and book a new one with the same doctor.\n\n**Note:** You can only cancel appointments that haven't started yet.\n\n**After cancellation:** The slot becomes available for others.\n\nNeed help with anything else?`,
    suggestions: ['View appointments', 'Book new appointment'],
  },

  /* ── Specialist recommendation ── */
  {
    patterns: ['which doctor', 'what doctor', 'specialist', 'speciality', 'specialty', 'who should i see', 'which specialist'],
    response: `🏥 **Which Specialist Should You See?**\n\n| Condition | Specialist |\n|-----------|------------|\n| Heart issues | Cardiologist |\n| Skin problems | Dermatologist |\n| Bone/joint pain | Orthopedist |\n| Brain/nerves | Neurologist |\n| Child health | Pediatrician |\n| Diabetes/hormones | Endocrinologist |\n| Eye problems | Ophthalmologist |\n| Ear/nose/throat | ENT Specialist |\n| Mental health | Psychiatrist |\n| Women's health | Gynecologist |\n| Teeth | Dentist |\n| Stomach/digestion | Gastroenterologist |\n| General concerns | General Physician |\n\nNot sure? Start with a **General Physician** — they'll refer you if needed.`,
    suggestions: ['Find General Physician', 'Book appointment', 'Search doctors'],
  },

  /* ── Cost / Fees ── */
  {
    patterns: ['cost', 'price', 'fee', 'charge', 'how much', 'consultation fee', 'payment'],
    response: `💰 **Consultation Fees on MediChain:**\n\nFees vary by doctor specialization and experience. You can see consultation fees on each doctor's profile before booking.\n\n**Typical ranges (India):**\n• General Physician: ₹200–₹800\n• Specialist: ₹500–₹2,000\n• Super-specialist: ₹1,000–₹3,000\n\n**Payment info:**\nPayment is handled at the clinic/hospital. Online payment integration is coming soon.\n\nCheck the doctor's profile for their specific fees.`,
    suggestions: ['Search doctors', 'Find affordable doctors'],
  },

  /* ── Insurance ── */
  {
    patterns: ['insurance', 'coverage', 'ayushman', 'esic', 'cghs', 'health card'],
    response: `🏥 **Health Insurance in India:**\n\n**Government schemes:**\n• **Ayushman Bharat (PMJAY)** — covers ₹5 lakh/year for eligible families\n• **ESIC** — for salaried employees\n• **CGHS** — for central govt employees\n• **State schemes** — varies by state\n\n**Private insurance:**\n• Mediclaim policies from LIC, Star Health, HDFC Ergo, etc.\n• Typically covers hospitalisation, surgery, ICU\n\n**Tips:**\n• Always carry your health card to the clinic\n• Confirm if the doctor/hospital accepts your insurance\n• Pre-authorization may be needed for planned procedures\n\nFor insurance-specific queries, contact your insurer directly.`,
    suggestions: ['Book appointment', 'Emergency contacts'],
  },

  /* ── COVID ── */
  {
    patterns: ['covid', 'corona', 'coronavirus', 'covid-19', 'vaccine', 'vaccination', 'booster'],
    response: `🦠 **COVID-19 Information:**\n\n**Common symptoms:**\nFever, dry cough, fatigue, loss of taste/smell, sore throat, body ache\n\n**When to seek emergency care:**\n• Difficulty breathing\n• Persistent chest pain\n• Confusion or inability to stay awake\n• Bluish lips or face\n\n**Home isolation guidelines:**\n• Isolate in a separate room\n• Wear mask around others\n• Monitor oxygen saturation (SpO₂ > 94%)\n• Drink plenty of fluids\n• Follow doctor's advice\n\n**Vaccines available in India:**\nCovaxin, Covishield, Corbevax, Covovax\n\n**Where to get vaccinated:**\nCoWIN app (cowin.gov.in) — find nearest centre\n\n*For current guidelines, check the official Ministry of Health website.*`,
    suggestions: ['Find General Physician', 'Emergency contacts', 'Vaccination centres'],
  },

  /* ── Health tips ── */
  {
    patterns: ['health tip', 'healthy', 'diet', 'nutrition', 'fitness', 'exercise', 'wellness', 'lifestyle'],
    response: `🌱 **Daily Health Tips:**\n\n**Nutrition:**\n• Eat the rainbow — varied fruits & vegetables\n• Whole grains > refined carbs\n• Healthy fats: nuts, seeds, avocado, olive oil\n• Limit processed food, sugar, and excess salt\n• Stay hydrated — 8 glasses of water daily\n\n**Exercise:**\n• 150 minutes moderate aerobic activity/week\n• 2 days strength training/week\n• Even 30 min walking daily makes a difference\n• Stretch for flexibility and injury prevention\n\n**Sleep:**\n• 7–9 hours for adults\n• Consistent sleep/wake schedule\n• Dark and cool bedroom\n\n**Mental wellness:**\n• Mindfulness or meditation 10 min/day\n• Strong social connections\n• Limit social media\n\n**Preventive care:**\n• Regular checkups even when healthy\n• Annual blood tests\n• Dental cleaning every 6 months\n• Eye exam annually`,
    suggestions: ['Mental health tips', 'Find doctor for checkup', 'Nutrition guide'],
  },

  /* ── Pregnancy / Women's health ── */
  {
    patterns: ['pregnancy', 'pregnant', 'gynecologist', 'gynaecologist', 'period', 'menstrual', 'pcos', 'pcod'],
    response: `👩‍⚕️ **Women's Health Guide:**\n\n**During Pregnancy:**\n• Start folic acid supplements before conception\n• Regular prenatal checkups\n• Avoid alcohol, smoking, raw fish\n• Monitor blood pressure and blood sugar\n• First trimester: ultrasound around week 12\n• Regular movement, light exercise is fine\n\n**PCOS/PCOD:**\n• Common condition affecting 1 in 10 women\n• Symptoms: irregular periods, weight gain, acne, facial hair\n• Management: diet, exercise, medication\n• See a Gynecologist for proper diagnosis\n\n**Period health:**\n• Irregular periods can indicate thyroid issues, PCOS, stress\n• Severe pain (dysmenorrhea) should be evaluated\n• Track your cycle with an app\n\nSee a **Gynecologist** for all women's health concerns.`,
    suggestions: ['Find Gynecologist', 'Pregnancy diet tips', 'PCOS management'],
  },

  /* ── Dental ── */
  {
    patterns: ['tooth', 'teeth', 'dental', 'gum', 'toothache', 'cavity', 'dentist', 'mouth'],
    response: `🦷 **Dental Health Guide:**\n\n**For toothache:**\n• Rinse with warm salt water\n• Clove oil on the aching tooth (temporary relief)\n• Ibuprofen for pain relief\n• Avoid very hot, cold, or sweet foods\n• See a dentist promptly — don't delay!\n\n**Daily dental care:**\n• Brush twice daily (2 minutes each)\n• Floss once daily\n• Use fluoride toothpaste\n• Replace toothbrush every 3 months\n• Limit sugary foods and drinks\n\n**See a Dentist immediately for:**\n• Severe persistent toothache\n• Swollen face or jaw\n• Loose permanent teeth\n• Bleeding gums that don't stop\n• Knocked-out tooth (within 1 hour)\n\n**Checkups:** Every 6 months, even without pain!`,
    suggestions: ['Find Dentist', 'Book appointment', 'Dental hygiene tips'],
  },

  /* ── Eye problems ── */
  {
    patterns: ['eye', 'vision', 'blurry', 'blur', 'glasses', 'contact lens', 'ophthalmologist', 'optometrist'],
    response: `👁️ **Eye Health Guide:**\n\n**For eye strain (screens):**\n• 20-20-20 rule: Every 20 min, look 20 feet away for 20 seconds\n• Adjust screen brightness and contrast\n• Use blue light glasses\n• Maintain 50–70cm distance from screen\n• Blink consciously — screens reduce blinking\n\n**Common conditions:**\n• **Conjunctivitis (pink eye)** — infectious, avoid touching others\n• **Dry eyes** — use lubricating eye drops\n• **Styes** — warm compress 3–4 times daily\n• **Myopia/Hyperopia** — correctable with glasses/contacts\n\n**Emergency — Go immediately:**\n• Sudden vision loss\n• Eye injury or chemical exposure\n• Flashes of light or sudden floaters\n• Eye pain with headache and nausea\n\nSee an **Ophthalmologist** annually for eye exams.`,
    suggestions: ['Find Ophthalmologist', 'Eye exercises', 'Book appointment'],
  },

  /* ── Default fallback ── */
  {
    patterns: [],
    response: `I'm not sure I understood that completely. Here are some things I can help with:\n\n• **Symptom guidance** — fever, headache, chest pain, back pain...\n• **Appointment help** — how to book, cancel, or reschedule\n• **Finding the right specialist** — which doctor for which condition\n• **Emergency help** — ambulance, blood banks, contacts\n• **Health tips** — diet, exercise, mental wellness\n• **FAQs** — insurance, costs, medication\n\nTry asking something like:\n_"I have a fever"_ or _"How do I book an appointment?"_`,
    suggestions: ['Symptom checker', 'Book appointment', 'Emergency help', 'Health tips'],
  },
];

export function getBotResponse(message) {
  const msg = message.toLowerCase().trim();

  for (const item of RESPONSES) {
    if (item.patterns.length > 0 && item.patterns.some(p => msg.includes(p))) {
      return item;
    }
  }

  return RESPONSES[RESPONSES.length - 1]; // fallback
}

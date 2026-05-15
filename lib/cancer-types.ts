export type CancerSubtype = {
  displayName: string
  overrides: {
    treatmentModalities?: string[]
    commonSideEffects?: string[]
    commonMedications?: string[]
    keyConsiderations?: string
    specialistTypes?: string[]
    stagingNotes?: string
  }
}

export type CancerTypeInfo = {
  displayName: string
  treatmentModalities: string[]
  commonSideEffects: string[]
  commonMedications: string[]
  relevantDocumentTypes: string[]
  specialistTypes: string[]
  keyConsiderations: string
  stagingNotes: string
  supportOrganizations: string[]
  subtypes?: Record<string, CancerSubtype>
  molecularMarkers?: string[]
}

const CANCER_TYPES: Record<string, CancerTypeInfo> = {
  breast_cancer: {
    displayName: "Breast cancer",
    treatmentModalities: ["surgery", "chemotherapy", "radiation", "hormone_therapy", "targeted_therapy", "immunotherapy"],
    commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Lymphedema", "Hot Flashes", "Joint Pain", "Neuropathy", "Brain Fog", "Bone Pain", "Mood Changes"],
    commonMedications: ["Tamoxifen", "Anastrozole (Arimidex)", "Letrozole (Femara)", "Trastuzumab (Herceptin)", "Pertuzumab (Perjeta)", "Palbociclib (Ibrance)", "Doxorubicin", "Cyclophosphamide", "Paclitaxel"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "cobra_notice", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Breast Surgeon", "Medical Oncologist", "Radiation Oncologist", "Plastic/Reconstructive Surgeon", "Genetic Counselor", "Primary Care", "Other"],
    keyConsiderations: "Breast cancer treatment varies significantly by subtype (HR+, HER2+, triple-negative). Hormone receptor status determines whether endocrine therapy is appropriate. Many patients face decisions about breast-conserving surgery vs mastectomy, and reconstruction options.",
    stagingNotes: "Uses TNM staging (Tumor size, Node involvement, Metastasis). Stage 0 is DCIS (pre-invasive). Stages I-III are localized/regional. Stage IV indicates metastatic disease.",
    supportOrganizations: ["Susan G. Komen", "Breastcancer.org", "Living Beyond Breast Cancer", "Young Survival Coalition", "National Breast Cancer Foundation"],
    molecularMarkers: ["BRCA1", "BRCA2", "PIK3CA", "PD-L1"],
    subtypes: {
      hr_pos_her2_neg: {
        displayName: "HR+/HER2- (Luminal)",
        overrides: {
          treatmentModalities: ["surgery", "hormone_therapy", "targeted_therapy", "radiation", "chemotherapy"],
          commonMedications: ["Tamoxifen", "Anastrozole (Arimidex)", "Letrozole (Femara)", "Palbociclib (Ibrance)", "Ribociclib (Kisqali)", "Abemaciclib (Verzenio)", "Fulvestrant (Faslodex)"],
          commonSideEffects: ["Fatigue", "Hot Flashes", "Joint Pain", "Bone Loss", "Mood Changes", "Weight Gain", "Nausea", "Brain Fog", "Lymphedema", "Vaginal Dryness"],
          keyConsiderations: "Most common breast cancer subtype. Hormone therapy is the cornerstone of treatment, often for 5-10 years. CDK4/6 inhibitors (palbociclib, ribociclib) have significantly improved outcomes for metastatic disease. Generally slower-growing with better prognosis than other subtypes. Oncotype DX test may guide chemotherapy decisions.",
        },
      },
      her2_positive: {
        displayName: "HER2+",
        overrides: {
          treatmentModalities: ["targeted_therapy", "chemotherapy", "surgery", "radiation"],
          commonMedications: ["Trastuzumab (Herceptin)", "Pertuzumab (Perjeta)", "T-DM1 (Kadcyla)", "Trastuzumab deruxtecan (Enhertu)", "Tucatinib (Tukysa)", "Lapatinib (Tykerb)", "Docetaxel", "Carboplatin"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Diarrhea", "Heart Function Changes", "Neuropathy", "Mouth Sores", "Skin Rash", "Lymphedema", "Brain Fog"],
          keyConsiderations: "HER2+ breast cancer is more aggressive but highly treatable with targeted therapies. Regular cardiac monitoring (echocardiograms) is essential during Herceptin-based treatment. Neoadjuvant (pre-surgery) treatment is common. Brain metastases are more common with HER2+ disease.",
        },
      },
      triple_negative: {
        displayName: "Triple-negative (TNBC)",
        overrides: {
          treatmentModalities: ["chemotherapy", "immunotherapy", "surgery", "radiation"],
          commonMedications: ["Pembrolizumab (Keytruda)", "Carboplatin", "Paclitaxel", "Doxorubicin", "Cyclophosphamide", "Sacituzumab govitecan (Trodelvy)", "Capecitabine"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Neuropathy", "Immune-related Side Effects", "Mouth Sores", "Low Blood Counts", "Appetite Loss", "Brain Fog", "Skin Rash"],
          keyConsiderations: "No hormone or HER2 targets, so chemotherapy and immunotherapy are the primary systemic options. Typically more aggressive, but some patients respond very well to neoadjuvant chemotherapy. PD-L1 testing determines immunotherapy eligibility. BRCA testing is especially important as PARP inhibitors may be an option.",
        },
      },
      dcis: {
        displayName: "DCIS (Stage 0)",
        overrides: {
          treatmentModalities: ["surgery", "radiation", "hormone_therapy"],
          commonMedications: ["Tamoxifen", "Anastrozole (Arimidex)"],
          commonSideEffects: ["Surgical Pain", "Fatigue", "Hot Flashes", "Joint Pain", "Skin Changes from Radiation", "Anxiety", "Lymphedema (rare)"],
          keyConsiderations: "Pre-invasive breast cancer with excellent prognosis. Treatment is surgery (lumpectomy or mastectomy) with possible radiation. No chemotherapy needed. Hormone therapy may be recommended to reduce recurrence risk. Some patients may qualify for active surveillance in clinical trials. The main decision is extent of surgery and whether radiation is necessary.",
          specialistTypes: ["Breast Surgeon", "Radiation Oncologist", "Medical Oncologist", "Primary Care", "Other"],
          stagingNotes: "DCIS is Stage 0 — non-invasive. Graded as low, intermediate, or high grade. Size and margins guide treatment decisions.",
        },
      },
    },
  },
  lung_cancer: {
    displayName: "Lung cancer",
    treatmentModalities: ["surgery", "chemotherapy", "radiation", "targeted_therapy", "immunotherapy"],
    commonSideEffects: ["Fatigue", "Shortness of Breath", "Cough", "Appetite Loss", "Nausea", "Neuropathy", "Skin Rash", "Chest Pain", "Weight Loss", "Brain Fog"],
    commonMedications: ["Pembrolizumab (Keytruda)", "Nivolumab (Opdivo)", "Osimertinib (Tagrisso)", "Alectinib (Alecensa)", "Carboplatin", "Cisplatin", "Pemetrexed", "Docetaxel"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Pulmonologist", "Thoracic Surgeon", "Medical Oncologist", "Radiation Oncologist", "Interventional Radiologist", "Primary Care", "Other"],
    keyConsiderations: "Lung cancer is divided into NSCLC and SCLC, with very different treatment approaches. Biomarker testing (EGFR, ALK, ROS1, PD-L1) is critical for selecting targeted therapies. Many patients qualify for immunotherapy. Breathing exercises and pulmonary rehabilitation can help manage symptoms.",
    stagingNotes: "NSCLC uses TNM staging (I-IV). SCLC traditionally uses limited vs extensive staging. Biomarker testing results significantly impact treatment decisions.",
    supportOrganizations: ["LUNGevity Foundation", "Lung Cancer Research Foundation", "GO2 for Lung Cancer", "American Lung Association"],
    molecularMarkers: ["EGFR", "ALK", "ROS1", "KRAS G12C", "PD-L1 %", "BRAF V600E", "MET", "RET", "NTRK"],
    subtypes: {
      nsclc_adenocarcinoma: {
        displayName: "NSCLC — Adenocarcinoma",
        overrides: {
          commonMedications: ["Osimertinib (Tagrisso)", "Alectinib (Alecensa)", "Sotorasib (Lumakras)", "Pembrolizumab (Keytruda)", "Carboplatin", "Pemetrexed", "Bevacizumab (Avastin)", "Amivantamab (Rybrevant)"],
          keyConsiderations: "Most common NSCLC subtype. Often driven by actionable biomarkers (EGFR, ALK, ROS1, KRAS G12C, RET, MET, NTRK). Comprehensive biomarker testing is essential before starting treatment — results can take 2-3 weeks but are worth waiting for. Targeted therapy can dramatically improve outcomes for patients with driver mutations.",
        },
      },
      nsclc_squamous: {
        displayName: "NSCLC — Squamous cell",
        overrides: {
          commonMedications: ["Pembrolizumab (Keytruda)", "Nivolumab (Opdivo)", "Carboplatin", "Paclitaxel", "Gemcitabine", "Necitumumab (Portrazza)", "Docetaxel"],
          keyConsiderations: "Less likely to have targetable biomarkers than adenocarcinoma, but PD-L1 testing is still critical for immunotherapy eligibility. Bevacizumab is generally avoided due to bleeding risk. Chemotherapy regimens differ from adenocarcinoma (paclitaxel or gemcitabine-based rather than pemetrexed).",
        },
      },
      sclc: {
        displayName: "Small cell (SCLC)",
        overrides: {
          treatmentModalities: ["chemotherapy", "radiation", "immunotherapy"],
          commonMedications: ["Etoposide", "Carboplatin", "Cisplatin", "Atezolizumab (Tecentriq)", "Durvalumab (Imfinzi)", "Topotecan", "Lurbinectedin (Zepzelca)"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Low Blood Counts", "Increased Infection Risk", "Appetite Loss", "Neuropathy", "Shortness of Breath", "Weight Loss", "Brain Fog"],
          keyConsiderations: "Very aggressive cancer that typically responds well initially to chemo but has high recurrence rates. Surgery is rarely an option. Prophylactic cranial irradiation (PCI) may be recommended to prevent brain metastases. Treatment is urgent — delays can significantly impact outcomes. Different staging system (limited vs extensive) than NSCLC.",
          stagingNotes: "Uses limited stage (confined to one side of chest, treatable with one radiation field) vs extensive stage (spread beyond). Does not use standard TNM staging. Most patients are diagnosed at extensive stage.",
        },
      },
    },
  },
  colorectal_cancer: {
    displayName: "Colorectal cancer",
    treatmentModalities: ["surgery", "chemotherapy", "radiation", "targeted_therapy", "immunotherapy"],
    commonSideEffects: ["Fatigue", "Diarrhea", "Nausea", "Neuropathy", "Appetite Loss", "Mouth Sores", "Hand-Foot Syndrome", "Abdominal Pain", "Changes in Bowel Habits", "Weight Loss"],
    commonMedications: ["5-Fluorouracil (5-FU)", "Capecitabine (Xeloda)", "Oxaliplatin (Eloxatin)", "Irinotecan (Camptosar)", "Bevacizumab (Avastin)", "Cetuximab (Erbitux)", "Pembrolizumab (Keytruda)"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Colorectal Surgeon", "Medical Oncologist", "Radiation Oncologist", "Gastroenterologist", "Genetic Counselor", "Primary Care", "Other"],
    keyConsiderations: "Treatment depends heavily on tumor location (colon vs rectum) and stage. MSI/MMR testing determines immunotherapy eligibility. Patients with Lynch syndrome need genetic counseling. Ostomy may be temporary or permanent depending on surgical approach.",
    stagingNotes: "Uses TNM staging (I-IV). Stage is determined after surgical pathology. CEA levels are monitored during and after treatment.",
    supportOrganizations: ["Colorectal Cancer Alliance", "Fight Colorectal Cancer", "Chris4Life", "Colon Cancer Foundation"],
    molecularMarkers: ["MSI-H/dMMR", "KRAS", "NRAS", "BRAF V600E", "HER2"],
    subtypes: {
      colon_cancer: {
        displayName: "Colon cancer",
        overrides: {
          keyConsiderations: "Surgery is usually the first treatment, followed by adjuvant chemotherapy for stage III and some stage II cases. Radiation is rarely used for colon cancer. MSI-H/dMMR tumors may respond dramatically to immunotherapy and may not need chemotherapy. Right-sided vs left-sided tumors have different molecular profiles and prognoses.",
          specialistTypes: ["Colorectal Surgeon", "Medical Oncologist", "Gastroenterologist", "Genetic Counselor", "Primary Care", "Other"],
        },
      },
      rectal_cancer: {
        displayName: "Rectal cancer",
        overrides: {
          treatmentModalities: ["radiation", "chemotherapy", "surgery", "targeted_therapy", "immunotherapy"],
          commonSideEffects: ["Fatigue", "Diarrhea", "Rectal Pain", "Nausea", "Neuropathy", "Bowel Function Changes", "Sexual Dysfunction", "Bladder Issues", "Hand-Foot Syndrome", "Skin Irritation from Radiation"],
          keyConsiderations: "Neoadjuvant chemoradiation (before surgery) is standard for locally advanced rectal cancer. Total neoadjuvant therapy (TNT) is increasingly used. Sphincter preservation is a key surgical goal — discuss with surgeon early. MSI-H rectal cancers may achieve complete response with immunotherapy alone (no surgery needed). Higher likelihood of temporary or permanent ostomy than colon cancer.",
          specialistTypes: ["Colorectal Surgeon", "Radiation Oncologist", "Medical Oncologist", "Gastroenterologist", "Wound/Ostomy Nurse", "Primary Care", "Other"],
        },
      },
    },
  },
  prostate_cancer: {
    displayName: "Prostate cancer",
    treatmentModalities: ["surgery", "radiation", "hormone_therapy", "active_surveillance", "chemotherapy", "targeted_therapy"],
    commonSideEffects: ["Fatigue", "Urinary Issues", "Erectile Dysfunction", "Hot Flashes", "Bone Loss", "Weight Gain", "Mood Changes", "Joint Pain", "Incontinence", "Decreased Libido"],
    commonMedications: ["Leuprolide (Lupron)", "Enzalutamide (Xtandi)", "Abiraterone (Zytiga)", "Docetaxel", "Cabazitaxel", "Darolutamide (Nubeqa)", "Olaparib (Lynparza)"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Urologist", "Radiation Oncologist", "Medical Oncologist", "Primary Care", "Other"],
    keyConsiderations: "Active surveillance is appropriate for many low-risk cases. Treatment decisions involve trade-offs between cancer control and quality of life (urinary and sexual function). Gleason score and PSA levels guide treatment intensity. ADT (androgen deprivation therapy) has significant long-term side effects.",
    stagingNotes: "Uses TNM staging plus Gleason score (Grade Group 1-5) and PSA levels. Risk stratification (low, intermediate, high) combines these factors.",
    supportOrganizations: ["Prostate Cancer Foundation", "ZERO - The End of Prostate Cancer", "Us TOO International", "Movember Foundation"],
    molecularMarkers: ["BRCA1/2", "ATM", "HRD"],
    subtypes: {
      low_risk: {
        displayName: "Low-risk (Grade Group 1)",
        overrides: {
          treatmentModalities: ["active_surveillance", "surgery", "radiation"],
          commonMedications: [],
          commonSideEffects: ["Anxiety about surveillance", "PSA testing anxiety"],
          keyConsiderations: "Active surveillance is the recommended approach for most patients — this is NOT the same as doing nothing. Involves regular PSA tests, digital rectal exams, and periodic biopsies. Many men on surveillance never need treatment. If treatment is eventually needed, outcomes are just as good as immediate treatment. The goal is to avoid unnecessary treatment side effects.",
          specialistTypes: ["Urologist", "Primary Care", "Other"],
        },
      },
      intermediate_risk: {
        displayName: "Intermediate-risk (Grade Group 2-3)",
        overrides: {
          treatmentModalities: ["surgery", "radiation", "hormone_therapy", "active_surveillance"],
          commonMedications: ["Leuprolide (Lupron)", "Bicalutamide"],
          keyConsiderations: "Treatment is usually recommended. Key decision is between surgery (radical prostatectomy) and radiation therapy — both have similar long-term cancer control. Each has different side effect profiles (surgery: more immediate urinary/erectile impact; radiation: gradual onset, bowel effects possible). Some favorable intermediate-risk patients may be candidates for active surveillance. Short-term ADT (4-6 months) may be added to radiation.",
        },
      },
      high_risk: {
        displayName: "High-risk / Locally advanced",
        overrides: {
          treatmentModalities: ["radiation", "hormone_therapy", "surgery", "chemotherapy"],
          commonMedications: ["Leuprolide (Lupron)", "Abiraterone (Zytiga)", "Enzalutamide (Xtandi)", "Docetaxel", "Bicalutamide", "Darolutamide (Nubeqa)"],
          commonSideEffects: ["Fatigue", "Hot Flashes", "Erectile Dysfunction", "Bone Loss", "Weight Gain", "Mood Changes", "Muscle Loss", "Cardiovascular Risk", "Incontinence", "Cognitive Changes"],
          keyConsiderations: "Multimodal treatment is standard — typically radiation plus long-term ADT (18-36 months), or surgery followed by radiation if adverse pathology. Long-term hormone therapy side effects need proactive management (bone density, cardiovascular health, metabolic syndrome). Exercise programs significantly improve outcomes and side effect management.",
        },
      },
      metastatic_crpc: {
        displayName: "Metastatic / Castration-resistant (mCRPC)",
        overrides: {
          treatmentModalities: ["hormone_therapy", "chemotherapy", "targeted_therapy", "radiation", "immunotherapy"],
          commonMedications: ["Enzalutamide (Xtandi)", "Abiraterone (Zytiga)", "Docetaxel", "Cabazitaxel", "Olaparib (Lynparza)", "Rucaparib (Rubraca)", "Radium-223 (Xofigo)", "Lutetium-177 PSMA (Pluvicto)"],
          commonSideEffects: ["Fatigue", "Bone Pain", "Hot Flashes", "Nausea", "Neuropathy", "Low Blood Counts", "Appetite Loss", "Weight Loss", "Fracture Risk", "Cognitive Changes"],
          keyConsiderations: "Treatment goal is disease control and quality of life. Multiple lines of therapy are available. BRCA/HRD testing is important — PARP inhibitors are an option for eligible patients. Bone-protective agents (denosumab, zoledronic acid) are essential. Clinical trials are especially valuable. Genomic testing may reveal additional targeted therapy options. Pain management and palliative care integration improve quality of life.",
          specialistTypes: ["Medical Oncologist", "Urologist", "Radiation Oncologist", "Palliative Care Specialist", "Pain Management", "Primary Care", "Other"],
        },
      },
    },
  },
  lymphoma: {
    displayName: "Lymphoma",
    treatmentModalities: ["chemotherapy", "radiation", "immunotherapy", "targeted_therapy", "stem_cell_transplant", "CAR-T_therapy"],
    commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Increased Infection Risk", "Neuropathy", "Mouth Sores", "Night Sweats", "Fever", "Weight Loss", "Itching"],
    commonMedications: ["ABVD regimen (doxorubicin, bleomycin, vinblastine, dacarbazine)", "R-CHOP regimen", "Rituximab (Rituxan)", "Brentuximab vedotin (Adcetris)", "Bendamustine", "Ibrutinib (Imbruvica)", "Lenalidomide (Revlimid)"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "cobra_notice", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Hematologist-Oncologist", "Radiation Oncologist", "Transplant Specialist", "Primary Care", "Other"],
    keyConsiderations: "Hodgkin's lymphoma has very high cure rates, especially in younger patients. Non-Hodgkin's lymphoma encompasses many subtypes with different treatment approaches. Some indolent NHL types may use watch-and-wait. Stem cell transplant may be needed for relapsed disease.",
    stagingNotes: "Uses Ann Arbor staging (I-IV) with A/B designation (B symptoms: fever, night sweats, weight loss). PET/CT is critical for staging and response assessment.",
    supportOrganizations: ["Leukemia & Lymphoma Society", "Lymphoma Research Foundation", "Lymphoma Action", "CancerCare"],
    subtypes: {
      hodgkins: {
        displayName: "Hodgkin's lymphoma",
        overrides: {
          commonMedications: ["ABVD regimen (doxorubicin, bleomycin, vinblastine, dacarbazine)", "Brentuximab vedotin (Adcetris)", "Pembrolizumab (Keytruda)", "Nivolumab (Opdivo)", "BEACOPP regimen", "ICE regimen (salvage)"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Increased Infection Risk", "Lung Toxicity (bleomycin)", "Neuropathy", "Fertility Impact", "Itching", "Night Sweats", "Thyroid Issues"],
          keyConsiderations: "High cure rate (80-90%+), even in advanced stages. ABVD is standard first-line treatment. PET-adapted therapy may allow shorter treatment for early responders. Bleomycin lung toxicity requires monitoring — avoid supplemental O2 during anesthesia. Fertility preservation should be discussed before treatment. Long-term survivorship monitoring is important (secondary cancers, cardiac effects, thyroid).",
          specialistTypes: ["Hematologist-Oncologist", "Radiation Oncologist", "Fertility Specialist", "Primary Care", "Other"],
        },
      },
      nhl_aggressive: {
        displayName: "Non-Hodgkin's — Aggressive (DLBCL, etc.)",
        overrides: {
          commonMedications: ["R-CHOP regimen (rituximab, cyclophosphamide, doxorubicin, vincristine, prednisone)", "Polatuzumab vedotin (Polivy)", "CAR-T therapy (axicabtagene ciloleucel, tisagenlecleucel)", "R-ICE regimen (salvage)", "Lenalidomide (Revlimid)", "Glofitamab (Columvi)"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Low Blood Counts", "Increased Infection Risk", "Neuropathy", "Mouth Sores", "Heart Function Changes", "Tumor Lysis Syndrome Risk", "Fever"],
          keyConsiderations: "Cure is the goal with aggressive NHL. R-CHOP is the standard regimen for DLBCL. Treatment is intensive but time-limited (typically 6 cycles over ~18 weeks). CNS prophylaxis may be needed for high-risk patients. CAR-T therapy is available for relapsed/refractory disease and can be curative. Interim PET scans guide treatment modifications.",
        },
      },
      nhl_indolent: {
        displayName: "Non-Hodgkin's — Indolent (Follicular, etc.)",
        overrides: {
          commonMedications: ["Rituximab (Rituxan)", "Bendamustine", "Obinutuzumab (Gazyva)", "Lenalidomide (Revlimid)", "R-CHOP regimen", "PI3K inhibitors (copanlisib, idelalisib)", "Tazemetostat (Tazverik)"],
          commonSideEffects: ["Fatigue", "Increased Infection Risk", "Nausea", "Low Blood Counts", "Rash", "Fever", "Night Sweats", "Autoimmune Issues", "Weight Loss", "Mood Changes"],
          keyConsiderations: "Watch-and-wait (active surveillance) is often the initial approach — not all patients need immediate treatment. These lymphomas are generally not curable but are very manageable long-term. Treatment is started when symptoms develop or disease progresses significantly. Rituximab maintenance may extend remissions. Transformation to aggressive lymphoma is a risk that requires monitoring. Many patients live decades with this disease.",
          specialistTypes: ["Hematologist-Oncologist", "Primary Care", "Other"],
          stagingNotes: "Ann Arbor staging (I-IV), but stage is less prognostic than in aggressive lymphoma. FLIPI score (Follicular Lymphoma International Prognostic Index) guides prognosis. Many patients are diagnosed at advanced stage but do well long-term.",
        },
      },
    },
  },
  gist_sarcoma: {
    displayName: "GIST / Sarcoma",
    treatmentModalities: ["surgery", "targeted_therapy", "radiation"],
    commonSideEffects: ["Fatigue", "Nausea", "Edema", "Muscle Cramps", "Diarrhea", "Skin Rash", "Periorbital Edema", "Appetite Loss", "Abdominal Pain", "Anemia"],
    commonMedications: ["Imatinib (Gleevec)", "Sunitinib (Sutent)", "Regorafenib (Stivarga)", "Ripretinib (Qinlock)", "Avapritinib (Ayvakit)", "Pazopanib (Votrient)"],
    relevantDocumentTypes: ["fmla_request", "appeal_letter", "disability_letter", "financial_hardship", "medical_records"],
    specialistTypes: ["Surgical Oncologist", "Medical Oncologist", "Sarcoma Specialist", "Gastroenterologist", "Primary Care", "Other"],
    keyConsiderations: "GISTs are NOT treated with traditional chemotherapy — they respond to targeted tyrosine kinase inhibitors. KIT and PDGFRA mutation testing is essential for treatment selection. Sarcomas are rare and should ideally be managed at specialized sarcoma centers. Long-term imatinib therapy is standard for many GIST patients.",
    stagingNotes: "GIST risk stratification is based on tumor size, mitotic rate, and location rather than traditional TNM staging. Sarcomas use AJCC staging incorporating grade, size, depth, and metastasis.",
    supportOrganizations: ["The Life Raft Group (GIST-specific)", "Sarcoma Alliance", "Sarcoma Foundation of America", "GIST Support International"],
    subtypes: {
      gist_kit: {
        displayName: "GIST — KIT mutation",
        overrides: {
          commonMedications: ["Imatinib (Gleevec)", "Sunitinib (Sutent)", "Regorafenib (Stivarga)", "Ripretinib (Qinlock)"],
          keyConsiderations: "Most common GIST type (~80%). Responds well to imatinib — often the first-line treatment for unresectable or metastatic disease. Specific KIT exon matters: exon 11 mutations respond best to imatinib, exon 9 mutations may need higher doses (800mg vs 400mg). Adjuvant imatinib for 3 years is standard after surgery for high-risk tumors. Do NOT stop imatinib without oncologist guidance — disease can rapidly progress.",
        },
      },
      gist_pdgfra_d842v: {
        displayName: "GIST — PDGFRA D842V",
        overrides: {
          commonMedications: ["Avapritinib (Ayvakit)"],
          commonSideEffects: ["Cognitive Effects", "Edema", "Nausea", "Fatigue", "Periorbital Edema", "Diarrhea", "Hair Color Changes", "Appetite Loss", "Anemia", "Memory Effects"],
          keyConsiderations: "Does NOT respond to imatinib, sunitinib, or regorafenib — these standard GIST drugs are ineffective. Avapritinib (Ayvakit) is the only approved targeted therapy and is highly effective. This is a critical distinction from KIT-mutant GIST. Cognitive side effects of avapritinib (memory, word-finding) should be monitored. Generally has a more indolent course than KIT-mutant GIST.",
        },
      },
      gist_sdh_deficient: {
        displayName: "GIST — SDH-deficient",
        overrides: {
          treatmentModalities: ["surgery"],
          commonMedications: [],
          commonSideEffects: ["Surgical Recovery", "Fatigue", "Abdominal Pain", "Appetite Changes"],
          keyConsiderations: "Does NOT respond to standard TKIs (imatinib, sunitinib, regorafenib). Surgery is the primary treatment. Younger patient population (often pediatric or young adult). Often indolent but can metastasize — typically to lymph nodes (unlike typical GIST). Must be managed at specialized sarcoma centers with SDH-deficient GIST expertise. May be associated with Carney-Stratakis syndrome or Carney triad. Immunotherapy and other novel approaches are being studied in clinical trials.",
          specialistTypes: ["Sarcoma Specialist", "Surgical Oncologist", "Medical Oncologist", "Genetic Counselor", "Primary Care", "Other"],
        },
      },
      gist_wildtype: {
        displayName: "GIST — Wild-type / NF1",
        overrides: {
          commonMedications: ["Variable — may trial imatinib", "Sunitinib (Sutent)", "Regorafenib (Stivarga)"],
          keyConsiderations: "No KIT or PDGFRA mutation identified. Variable response to TKIs — may trial imatinib but response is not guaranteed. NF1-associated GISTs are typically multifocal and often do not respond to imatinib. Molecular profiling to identify alternative drivers (BRAF, NTRK, SDH loss) may reveal targeted therapy options. Specialist referral to a sarcoma center is strongly recommended.",
        },
      },
      soft_tissue_sarcoma: {
        displayName: "Soft tissue sarcoma (non-GIST)",
        overrides: {
          treatmentModalities: ["surgery", "radiation", "chemotherapy"],
          commonMedications: ["Doxorubicin", "Ifosfamide", "Gemcitabine", "Docetaxel", "Pazopanib (Votrient)", "Trabectedin (Yondelis)", "Eribulin (Halaven)"],
          commonSideEffects: ["Fatigue", "Nausea", "Hair Loss", "Low Blood Counts", "Neuropathy", "Mouth Sores", "Cardiac Monitoring Needed", "Kidney Toxicity Risk", "Appetite Loss", "Surgical Recovery"],
          keyConsiderations: "Completely different from GIST — traditional chemotherapy IS used. Surgery with wide margins is the primary treatment. Radiation is often used before or after surgery for extremity sarcomas. Over 80 histologic subtypes exist — pathology review at a sarcoma center is critical. Doxorubicin-based chemotherapy is standard for advanced disease. Molecular profiling may identify targeted therapy options for specific subtypes.",
          specialistTypes: ["Sarcoma Specialist", "Surgical Oncologist", "Radiation Oncologist", "Medical Oncologist", "Orthopedic Oncologist", "Primary Care", "Other"],
          stagingNotes: "Uses AJCC staging incorporating tumor grade, size, depth, and metastasis. Grade (low vs high) is the most important prognostic factor. Histologic subtype significantly impacts behavior and treatment.",
        },
      },
    },
  },
}

/** All cancer type display names for use in dropdowns */
export const CANCER_TYPE_OPTIONS = Object.values(CANCER_TYPES).map((ct) => ct.displayName)

/** Get subtype options for a cancer type display name */
export function getSubtypeOptions(cancerType: string): { value: string; label: string }[] {
  const info = getCancerInfo(cancerType)
  if (!info?.subtypes) return []
  return Object.entries(info.subtypes).map(([key, sub]) => ({
    value: key,
    label: sub.displayName,
  }))
}

/** Get molecular marker options for a cancer type */
export function getMolecularMarkers(cancerType: string): string[] {
  const info = getCancerInfo(cancerType)
  return info?.molecularMarkers ?? []
}

// Fuzzy matching keywords to cancer type keys
const MATCH_PATTERNS: [RegExp, string][] = [
  [/breast/i, "breast_cancer"],
  [/lung/i, "lung_cancer"],
  [/colorectal|colon|rectal/i, "colorectal_cancer"],
  [/prostate/i, "prostate_cancer"],
  [/lymphoma|hodgkin/i, "lymphoma"],
  [/gist|sarcoma|gastrointestinal stromal/i, "gist_sarcoma"],
]

/** Look up a cancer type key from display name or free text */
function resolveCancerTypeKey(cancerType: string): string | null {
  if (!cancerType) return null
  const directKey = cancerType.toLowerCase().replace(/[\s/-]+/g, "_")
  if (CANCER_TYPES[directKey]) return directKey

  // Match by display name
  for (const [key, info] of Object.entries(CANCER_TYPES)) {
    if (info.displayName === cancerType) return key
  }

  // Fuzzy pattern match
  for (const [pattern, key] of MATCH_PATTERNS) {
    if (pattern.test(cancerType)) return key
  }

  return null
}

export function getCancerInfo(cancerType: string, cancerSubtype?: string | null): CancerTypeInfo | null {
  const key = resolveCancerTypeKey(cancerType)
  if (!key) return null

  const base = CANCER_TYPES[key]
  if (!cancerSubtype || !base.subtypes?.[cancerSubtype]) return base

  // Merge subtype overrides onto base
  const subtype = base.subtypes[cancerSubtype]
  return {
    ...base,
    ...subtype.overrides,
    // Preserve base fields that subtypes don't override
    displayName: base.displayName,
    relevantDocumentTypes: base.relevantDocumentTypes,
    supportOrganizations: base.supportOrganizations,
    subtypes: base.subtypes,
    molecularMarkers: base.molecularMarkers,
  }
}

/** Treatment goal options */
export const TREATMENT_GOAL_OPTIONS = [
  { value: "curative", label: "Curative intent" },
  { value: "control", label: "Disease management / Control" },
  { value: "palliative", label: "Palliative / Comfort-focused" },
  { value: "unsure", label: "Not sure yet" },
] as const

/** Hereditary syndrome options */
export const HEREDITARY_SYNDROME_OPTIONS = [
  { value: "lynch", label: "Lynch syndrome" },
  { value: "brca", label: "BRCA carrier" },
  { value: "li_fraumeni", label: "Li-Fraumeni syndrome" },
  { value: "fap", label: "FAP (Familial Adenomatous Polyposis)" },
  { value: "none", label: "None known" },
] as const

/** Metastatic site options (for Stage IV) */
export const METASTATIC_SITE_OPTIONS = [
  "Brain", "Bone", "Liver", "Lung", "Lymph nodes", "Other",
] as const

/** Build context options from a profile record */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function profileContextOptions(profile: Record<string, any>) {
  return {
    cancerSubtype: profile.cancer_subtype ?? null,
    treatmentGoal: profile.treatment_goal ?? null,
    molecularMarkers: profile.molecular_markers ?? null,
    currentMedications: profile.current_medications ?? null,
    metastaticSites: profile.metastatic_sites ?? null,
    hereditarySyndrome: profile.hereditary_syndrome ?? null,
  }
}

export function getCancerContext(
  cancerType: string,
  options?: {
    cancerSubtype?: string | null
    treatmentGoal?: string | null
    molecularMarkers?: string[] | null
    currentMedications?: string | null
    metastaticSites?: string[] | null
    hereditarySyndrome?: string | null
  }
): string {
  const info = getCancerInfo(cancerType, options?.cancerSubtype)
  if (!info) return ""

  const subtypeLabel = options?.cancerSubtype && info.subtypes?.[options.cancerSubtype]
    ? ` (${info.subtypes[options.cancerSubtype].displayName})`
    : ""

  let context = `--- Cancer-Specific Context: ${info.displayName}${subtypeLabel} ---
Treatment modalities for this cancer: ${info.treatmentModalities.join(", ")}
Common medications: ${info.commonMedications.join(", ")}
Common side effects: ${info.commonSideEffects.join(", ")}
Specialist types: ${info.specialistTypes.join(", ")}
Key considerations: ${info.keyConsiderations}
Staging: ${info.stagingNotes}
Support organizations: ${info.supportOrganizations.join(", ")}`

  if (options?.treatmentGoal) {
    const goalLabel = TREATMENT_GOAL_OPTIONS.find(g => g.value === options.treatmentGoal)?.label ?? options.treatmentGoal
    context += `\nTreatment goal: ${goalLabel}`
  }

  if (options?.molecularMarkers?.length) {
    context += `\nKnown molecular markers/mutations: ${options.molecularMarkers.join(", ")}`
  }

  if (options?.currentMedications) {
    context += `\nCurrent medications: ${options.currentMedications}`
  }

  if (options?.metastaticSites?.length) {
    context += `\nMetastatic sites: ${options.metastaticSites.join(", ")}`
  }

  if (options?.hereditarySyndrome && options.hereditarySyndrome !== "none") {
    const syndromeLabel = HEREDITARY_SYNDROME_OPTIONS.find(s => s.value === options.hereditarySyndrome)?.label ?? options.hereditarySyndrome
    context += `\nHereditary/genetic syndrome: ${syndromeLabel}`
  }

  context += `\n--- End Cancer-Specific Context ---`

  return context
}

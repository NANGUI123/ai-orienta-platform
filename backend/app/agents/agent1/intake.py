from app.services.llm import extraire_profil_llm

def extraire_profil(narratif: str) -> dict:
    # Version provisoire : on simule une extraction.
    # Plus tard, ici, on appellera le LLM.
    return extraire_profil_llm(narratif) 
#{
 #       "narratif_recu": narratif,
 #       "nb_mots": len(narratif.split()),
 #   }

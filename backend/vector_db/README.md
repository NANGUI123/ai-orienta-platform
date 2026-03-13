# Vector DB — University Embeddings

Ce dossier contiendra les embeddings vectoriels des établissements,
permettant une recherche sémantique pour affiner les recommandations ORIENTA.

## Structure prévue

```
university_embeddings/
├── index.faiss          ← Index FAISS (recherche ANN)
├── metadata.json        ← Métadonnées associées aux vecteurs
└── embeddings.npy       ← Vecteurs numpy (text-embedding-3-small)
```

## Pipeline de génération

```python
# Générer les embeddings depuis universities.json
from anthropic import Anthropic
import numpy as np, json, faiss

client = Anthropic()
data   = json.load(open("../data/universities.json"))

texts = [f"{e['nom']} {e['description']} {' '.join(e['domaines'])}"
         for e in data["etablissements"]]

# Utiliser OpenAI text-embedding-3-small ou équivalent
# puis indexer avec FAISS pour la recherche ANN
```

## Utilisation (roadmap v2)

```python
from vector_db.search import UniversitySearch

search = UniversitySearch()
results = search.query(
    domaine="Informatique Tech",
    ville="Lyon",
    budget=700,
    top_k=5
)
```

## Dépendances à ajouter pour activer

```
faiss-cpu==1.8.0
numpy>=1.26
openai>=1.0     # pour les embeddings
```

> Cette fonctionnalité est prévue pour la **v2** de la plateforme.
> En v1, les recommandations sont générées directement par Claude.

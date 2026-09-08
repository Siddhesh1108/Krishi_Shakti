const RAG_QUERY_URL = import.meta.env.VITE_N8N_RAG_QUERY_URL;
const DIAGNOSIS_URL = import.meta.env.VITE_N8N_DIAGNOSIS_URL;
const RAG_INGEST_URL = import.meta.env.VITE_N8N_RAG_INGEST_URL;

export const postRAGQuery = async (question, farmerId) => {
  if (!RAG_QUERY_URL) throw new Error('RAG Query URL not configured');
  const response = await fetch(RAG_QUERY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, farmerId })
  });
  if (!response.ok) throw new Error('Failed to query RAG assistant');
  return response.json();
};

export const postDiagnosis = async (imageFile, crop, symptoms) => {
  if (!DIAGNOSIS_URL) throw new Error('Diagnosis URL not configured');
  const formData = new FormData();
  if (imageFile) formData.append('image', imageFile);
  formData.append('crop', crop);
  formData.append('symptoms', JSON.stringify(symptoms));

  const response = await fetch(DIAGNOSIS_URL, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Failed to analyze crop image');
  return response.json();
};

export const postRAGIngest = async (documentData) => {
  if (!RAG_INGEST_URL) throw new Error('RAG Ingest URL not configured');
  const response = await fetch(RAG_INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(documentData)
  });
  if (!response.ok) throw new Error('Failed to ingest document');
  return response.json();
};

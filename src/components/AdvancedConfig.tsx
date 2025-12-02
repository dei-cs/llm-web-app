"use client";

import { useState, useEffect } from 'react';

interface RAGConfig {
  enabled: boolean;
  n_results: number;
  relevance_threshold: number;
  collection_name: string;
  query_extraction: {
    max_tokens: number;
  };
}

interface AcademicSearchConfig {
  enabled: boolean;
  max_results: number;
}

interface ChunkingConfig {
  max_chars: number;
  overlap: number;
}

interface PromptsConfig {
  system_message: string;
  context_template: string;
  academic_context_header: string;
}

export default function AdvancedConfig() {
  const [ragConfig, setRagConfig] = useState<RAGConfig | null>(null);
  const [academicConfig, setAcademicConfig] = useState<AcademicSearchConfig | null>(null);
  const [chunkingConfig, setChunkingConfig] = useState<ChunkingConfig | null>(null);
  const [promptsConfig, setPromptsConfig] = useState<PromptsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [ragRes, academicRes, docRes, promptsRes] = await Promise.all([
        fetch('/api/config/rag'),
        fetch('/api/config/academic_search'),
        fetch('/api/config/document_processing'),
        fetch('/api/config/prompts')
      ]);

      if (ragRes.ok && academicRes.ok && docRes.ok && promptsRes.ok) {
        const ragData = await ragRes.json();
        const academicData = await academicRes.json();
        const docData = await docRes.json();
        const promptsData = await promptsRes.json();

        setRagConfig(ragData);
        setAcademicConfig(academicData);
        setChunkingConfig(docData.chunking);
        setPromptsConfig(promptsData);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRAG = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/config/rag/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setRagConfig(prev => prev ? { ...prev, enabled } : null);
      }
    } catch (error) {
      console.error('Failed to toggle RAG:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateRAGConfig = async () => {
    if (!ragConfig) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config/rag', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n_results: ragConfig.n_results,
          relevance_threshold: ragConfig.relevance_threshold,
        }),
      });

      if (response.ok) {
        console.log('RAG config updated');
      }
    } catch (error) {
      console.error('Failed to update RAG config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateQueryExtractionConfig = async () => {
    if (!ragConfig) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config/rag/query_extraction', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: ragConfig.query_extraction.max_tokens,
        }),
      });

      if (response.ok) {
        console.log('Query extraction config updated');
      }
    } catch (error) {
      console.error('Failed to update query extraction config:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAcademicSearch = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/config/academic_search/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setAcademicConfig(prev => prev ? { ...prev, enabled } : null);
      }
    } catch (error) {
      console.error('Failed to toggle academic search:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateAcademicConfig = async () => {
    if (!academicConfig) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config/academic_search', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_results: academicConfig.max_results,
        }),
      });

      if (response.ok) {
        console.log('Academic search config updated');
      }
    } catch (error) {
      console.error('Failed to update academic search config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateChunkingConfig = async () => {
    if (!chunkingConfig) return;

    setSaving(true);
    try {
      const response = await fetch('/api/config/document_processing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunkingConfig),
      });

      if (response.ok) {
        console.log('Chunking config updated');
      }
    } catch (error) {
      console.error('Failed to update chunking config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updatePromptsConfig = async () => {
    if (!promptsConfig) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/config/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_message: promptsConfig.system_message,
        }),
      });

      if (response.ok) {
        console.log('Prompts config updated');
      }
    } catch (error) {
      console.error('Failed to update prompts config:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading configuration...</div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Advanced Configuration</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Fine-tune RAG and document processing parameters
      </p>

      <div className="space-y-6">
        {/* System Message Configuration */}
        {promptsConfig && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium pb-2 border-b border-border">System Instructions</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                System Message
              </label>
              <textarea
                value={promptsConfig.system_message}
                onChange={(e) => setPromptsConfig({ ...promptsConfig, system_message: e.target.value })}
                onBlur={() => updatePromptsConfig()}
                rows={2}
                className="w-full rounded-lg border border-input bg-background text-foreground px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter system message for the LLM..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Instructions that define the AI's behavior and personality
              </p>
            </div>
          </div>
        )}

        {/* Academic Search Configuration */}
        {academicConfig && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-1">
                <label htmlFor="academic-enabled" className="text-sm font-medium">
                  Academic Search (arXiv Integration)
                </label>
                <p className="text-sm text-muted-foreground">
                  Search and retrieve academic papers from arXiv to enhance responses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="academic-enabled"
                  className="sr-only peer"
                  checked={academicConfig.enabled}
                  onChange={(e) => toggleAcademicSearch(e.target.checked)}
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {academicConfig.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Papers to Retrieve: {academicConfig.max_results}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={academicConfig.max_results}
                    onChange={(e) => setAcademicConfig({ ...academicConfig, max_results: parseInt(e.target.value) })}
                    onMouseUp={() => updateAcademicConfig()}
                    onTouchEnd={() => updateAcademicConfig()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of academic papers to retrieve from arXiv per search
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RAG Configuration */}
        {ragConfig && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="space-y-1">
                <label htmlFor="rag-enabled" className="text-sm font-medium">
                  RAG (Retrieval-Augmented Generation)
                </label>
                <p className="text-sm text-muted-foreground">
                  Enhance responses with relevant documents from your knowledge base
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="rag-enabled"
                  className="sr-only peer"
                  checked={ragConfig.enabled}
                  onChange={(e) => toggleRAG(e.target.checked)}
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {ragConfig.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-muted">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Query Extraction Max Tokens: {ragConfig.query_extraction.max_tokens}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={ragConfig.query_extraction.max_tokens}
                    onChange={(e) => setRagConfig({
                      ...ragConfig,
                      query_extraction: {
                        ...ragConfig.query_extraction,
                        max_tokens: parseInt(e.target.value)
                      }
                    })}
                    onMouseUp={() => updateQueryExtractionConfig()}
                    onTouchEnd={() => updateQueryExtractionConfig()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum tokens for extracting search queries from user messages (~{Math.round(ragConfig.query_extraction.max_tokens * 0.75)} words)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Results: {ragConfig.n_results}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={ragConfig.n_results}
                    onChange={(e) => setRagConfig({ ...ragConfig, n_results: parseInt(e.target.value) })}
                    onMouseUp={() => updateRAGConfig()}
                    onTouchEnd={() => updateRAGConfig()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How many documents to retrieve for context
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Relevance Threshold: {ragConfig.relevance_threshold.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={ragConfig.relevance_threshold}
                    onChange={(e) => setRagConfig({ ...ragConfig, relevance_threshold: parseFloat(e.target.value) })}
                    onMouseUp={() => updateRAGConfig()}
                    onTouchEnd={() => updateRAGConfig()}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Filter documents by similarity score (lower = stricter)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Document Processing Configuration */}
        {chunkingConfig && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium pb-2 border-b border-border">Document Processing</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Chunk Size: {chunkingConfig.max_chars} characters
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={chunkingConfig.max_chars}
                onChange={(e) => setChunkingConfig({ ...chunkingConfig, max_chars: parseInt(e.target.value) })}
                onMouseUp={() => updateChunkingConfig()}
                onTouchEnd={() => updateChunkingConfig()}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum characters per document chunk
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Chunk Overlap: {chunkingConfig.overlap} characters
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={chunkingConfig.overlap}
                onChange={(e) => setChunkingConfig({ ...chunkingConfig, overlap: parseInt(e.target.value) })}
                onMouseUp={() => updateChunkingConfig()}
                onTouchEnd={() => updateChunkingConfig()}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Overlap between consecutive chunks (helps preserve context)
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <button
            onClick={loadConfig}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Reload Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

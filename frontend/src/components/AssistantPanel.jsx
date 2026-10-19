// UH10 #119: asistente para preguntas sobre el colectivo. Si falla, el mapa y el estado siguen intactos.
import { useState } from 'react';
import Uh9Alert from './Uh9Alert';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const MAX = 300;

async function askAssistant(question) {
  let r;
  try {
    r = await fetch(`${BASE}/assistant/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new Error('No pudimos conectar con el servidor. El mapa y el estado del recorrido siguen disponibles.');
  }
  const data = await r.json().catch(() => null);
  if (!r.ok || !data?.answer) throw new Error(data?.detail || 'No pudimos consultar al asistente.');
  return data;
}

export default function AssistantPanel() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const send = async (e) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    try {
      setResult(await askAssistant(q));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="text-[13px] font-bold text-ink">Pregúntale al asistente</div>
      <form onSubmit={send} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="assistant-q" className="sr-only">Pregunta sobre el colectivo</label>
        <input id="assistant-q" type="text" value={question} maxLength={MAX} disabled={loading}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ej: ¿Dónde está el colectivo?"
          className="min-w-0 flex-1 rounded-[10px] border border-gray-200 px-3 py-2 text-[13px] text-ink outline-none focus:border-blue" />
        <button type="submit" className="uh9-recover-btn self-stretch sm:self-auto" disabled={loading || !question.trim()}>
          {loading ? 'Consultando...' : 'Preguntar'}
        </button>
      </form>

      {error && (
        <Uh9Alert variant="danger" title="El asistente no respondió" message={error}
          actionLabel="Reintentar" onAction={send} disabled={loading} />
      )}

      {result && !error && (
        <div className="flex flex-col gap-2" aria-live="polite">
          {result.notice && <Uh9Alert variant="warn" message={result.notice} />}
          <p className="text-[13px] leading-relaxed text-ink">{result.answer}</p>
          <span className="text-[11px] font-semibold text-gray-400">
            {result.source === 'ai' ? 'Respuesta generada con IA a partir de los datos del sistema' : 'Respuesta automática con los datos del sistema'}
          </span>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Plus, ListPlus, Type, Loader2 } from 'lucide-react';

export default function AddWordForm({ apiKey, onAddMultiple }) {
  const [mode, setMode] = useState('single'); 
  
  const [en, setEn] = useState('');
  const [ko, setKo] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAIExamples = async (wordsArray) => {
    if (!apiKey) {
      alert("⚠️ 상단의 설정(⚙️) 아이콘을 눌러 구글 Gemini API 키를 먼저 등록해주세요.\n\n(설정된 키가 있어야 AI가 예문을 만들어드릴 수 있습니다)");
      return;
    }
    
    setLoading(true);
    try {
      const prompt = `You are a helpful English teacher API. I will give you a JSON array of words. For each object, keep purely the "en" and "ko" keys exactly as they are without modifying them, but generate and add TWO new string keys: "example" (a highly practical, natural English conversational sentence using the word) and "exampleKo" (a natural Korean translation of that sentence). Return exactly the updated JSON array, without any markdown formatting or extra text. Output strictly JSON array format.\n\nHere is the input array: ${JSON.stringify(wordsArray)}`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'API Error');
      
      let text = data.candidates[0].content.parts[0].text;
      if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      else if (text.startsWith('```')) text = text.replace(/```/g, '').trim();
      
      const generatedWords = JSON.parse(text);
      if (!Array.isArray(generatedWords)) throw new Error('Invalid format returned by AI');
      
      const finalWords = generatedWords.map(w => ({
        id: Date.now() + Math.random(),
        en: String(w.en || '').trim(),
        ko: String(w.ko || '').trim(),
        example: String(w.example || '').trim(),
        exampleKo: String(w.exampleKo || '').trim()
      }));

      onAddMultiple(finalWords);
      
      if (mode === 'single') {
        setEn(''); setKo('');
      } else {
        setBulkText('');
      }
    } catch (error) {
      console.error(error);
      alert("❗ AI 예문 생성에 실패했습니다.\n입력값이 너무 많거나 API 키가 유효한지 다시 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!en.trim() || !ko.trim()) return;
    // If no API key, allow manual add without AI-generated examples
    if (!apiKey) {
      onAddMultiple([{ id: Date.now(), en: en.trim(), ko: ko.trim(), example: '', exampleKo: '' }]);
      setEn(''); setKo('');
      return;
    }

    await fetchAIExamples([{ en: en.trim(), ko: ko.trim() }]);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    
    const lines = bulkText.split('\n');
    const parsedWords = [];
    
    lines.forEach(line => {
      const parts = line.split(/[,:\-\t]/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        parsedWords.push({ en: parts[0], ko: parts.slice(1).join(', ') });
      } else {
        const spaceParts = line.trim().split(' ').map(s => s.trim()).filter(Boolean);
        if (spaceParts.length >= 2) {
          parsedWords.push({ en: spaceParts[0], ko: spaceParts.slice(1).join(' ') });
        }
      }
    });

    if (parsedWords.length > 0) {
      // If no API key, add parsed words directly without examples
      if (!apiKey) {
        const simpleWords = parsedWords.map(w => ({ id: Date.now() + Math.random(), en: w.en, ko: w.ko, example: '', exampleKo: '' }));
        onAddMultiple(simpleWords);
        setBulkText('');
      } else {
        await fetchAIExamples(parsedWords);
      }
    } else {
      alert("단어와 뜻이 올바르게 구분된 텍스트를 하나 이상 입력해주세요.");
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> 단어 입력 (예문 자동 생성 ✨)
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={() => setMode('single')}
            style={{ 
              padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem',
              background: mode === 'single' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: mode === 'single' ? '#fff' : 'var(--text-muted)'
            }}
            disabled={loading}
          >
            단건 추가
          </button>
          <button 
            type="button" 
            onClick={() => setMode('bulk')}
            style={{ 
              padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem',
              background: mode === 'bulk' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: mode === 'bulk' ? '#fff' : 'var(--text-muted)'
            }}
            disabled={loading}
          >
            대량 추가 (텍스트)
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="fade-in">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <input 
                type="text" 
                placeholder="영어 단어 (예: Apple)" 
                value={en} 
                onChange={(e) => setEn(e.target.value)} 
                disabled={loading}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <input 
                type="text" 
                placeholder="한국어 뜻 (예: 사과)" 
                value={ko} 
                onChange={(e) => setKo(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              * 추가 시 AI가 예문을 자동으로 만들어줍니다.
            </span>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? <Loader2 size={20} className="spin" /> : <Type size={20} />} 
              {loading ? 'AI 분석 및 예문 생성 중...' : '추가하기'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="fade-in">
          <textarea 
            placeholder="단어와 뜻을 입력해주세요.&#13;&#10;예시:&#13;&#10;Apple - 사과&#13;&#10;Banana, 바나나"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', minHeight: '120px', background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)', color: 'var(--text-main)', 
              padding: '1rem', borderRadius: '8px', outline: 'none', 
              fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.5',
              marginBottom: '1rem', opacity: loading ? 0.7 : 1
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              * 추가 버튼을 누르면 모든 문장에 대해 상황에 맞는 예문을 제공합니다.
            </span>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? <Loader2 size={20} className="spin" /> : <ListPlus size={20} />} 
              {loading ? 'AI 전체 문장 분석 중...' : '텍스트 일괄 추가'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

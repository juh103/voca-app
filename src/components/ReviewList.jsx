import { Volume2, CheckCircle2, Play } from 'lucide-react';

export default function ReviewList({ wrongWords, onRemove, onStartTest }) {
  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.name === 'Google US English')
                      || voices.find(v => v.lang === 'en-US')
                      || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  };

  if (wrongWords.length === 0) {
    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ color: 'var(--success)', marginBottom: '1rem', fontSize: '1.8rem' }}>🎉 완벽합니다!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>현재 오답 노트에 남은 단어가 없습니다. <br />전체 테스트에 도전해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ color: 'var(--danger)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🚨 극복해야 할 오답 단어 ({wrongWords.length}개)
        </h3>
        <button className="btn-primary" onClick={onStartTest} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger)' }}>
          <Play size={18} /> 오답만 테스트하기
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {wrongWords.map(word => (
          <div 
            key={word.id} 
            className="glass-panel word-item list-enter" 
            style={{ borderLeft: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="word-info">
                <span className="word-en">
                  {word.en}
                  <button className="icon-btn speak" onClick={() => speak(word.en)} title="발음 듣기">
                    <Volume2 size={24} strokeWidth={2.5} />
                  </button>
                </span>
                <span className="word-ko">{word.ko}</span>
              </div>
              <div className="word-actions">
                <button 
                  className="icon-btn" 
                  style={{ color: 'var(--success)' }} 
                  onClick={() => onRemove(word.id)} 
                  title="외웠음! (오답표에서 지우기)"
                >
                  <CheckCircle2 size={28} />
                </button>
              </div>
            </div>

            {word.example && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ fontStyle: 'italic', color: '#e2e8f0', flex: 1, lineHeight: '1.4' }}>
                    "{word.example}"
                  </span>
                  <button 
                    className="icon-btn speak" 
                    onClick={() => speak(word.example)} 
                    title="예문 듣기" 
                    style={{ padding: '0.2rem', color: '#a5b4fc' }}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
                {word.exampleKo && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                    {word.exampleKo}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Play, ArrowLeft, ArrowRight } from 'lucide-react';

export default function TestSection({ words, onWrongAnswer, onCorrectAnswer }) {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [testWords, setTestWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [testMode, setTestMode] = useState('ko_to_en');

  useEffect(() => {
    if (words.length === 0) {
      setStages([]);
      return;
    }
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const N = shuffled.length;
    let K = Math.max(1, Math.ceil(N / 30));
    
    const newStages = [];
    let startIdx = 0;
    for (let i = 0; i < K; i++) {
        const extra = i < (N % K) ? 1 : 0;
        const chunkSize = Math.floor(N / K) + extra;
        const chunkWords = shuffled.slice(startIdx, startIdx + chunkSize);
        newStages.push(chunkWords);
        startIdx += chunkSize;
    }
    setStages(newStages);
  }, [words]);

  const startTest = (targetWords, stageIdx = null) => {
    setCurrentStageIndex(stageIdx);
    const shuffled = [...targetWords].sort(() => 0.5 - Math.random());
    setTestWords(shuffled);
    setCurrentIndex(0);
    setInputVal('');
    setFeedback(null);
    setScore(0);
    setIsFinished(false);
    setIsStarted(true);
  };

  const handleReturn = () => {
    setCurrentStageIndex(null);
    setIsStarted(false);
    setIsFinished(false);
  };

  const speak = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.name === 'Google US English')
                      || voices.find(v => v.lang === 'en-US')
                      || voices.find(v => v.lang.startsWith('en'));
                      
    if (englishVoice) {
      utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || feedback) return;

    const currentWord = testWords[currentIndex];
    
    let isCorrect = false;
    if (testMode === 'ko_to_en') {
      isCorrect = inputVal.trim().toLowerCase() === currentWord.en.toLowerCase();
    } else {
      const inputStr = inputVal.trim().replace(/\s+/g, '');
      const koStr = currentWord.ko.trim().replace(/\s+/g, '');
      isCorrect = inputStr === koStr || currentWord.ko.split(',').map(s => s.trim().replace(/\s+/g, '')).includes(inputStr);
    }
    
    if (isCorrect) {
      setFeedback('success');
      setScore(s => s + 1);
      speak(currentWord.en); 
      if (onCorrectAnswer) onCorrectAnswer(currentWord.id);
    } else {
      setFeedback('error');
      if (onWrongAnswer) onWrongAnswer(currentWord.id);
    }

    setTimeout(() => {
      if (currentIndex + 1 < testWords.length) {
        setCurrentIndex(c => c + 1);
        setInputVal('');
        setFeedback(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  if (words.length === 0) {
    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        테스트를 진행하려면 단어장에 단어가 필요합니다.
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="glass-panel fade-in" style={{ padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>테스트 모드 🚀</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            총 <strong>{words.length}</strong>개의 단어가 피로도를 줄이기 위해 랜덤하게 분할되었습니다.<br/>
            원하는 단계를 선택하여 바로 도장을 격파해 보세요!
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setTestMode('ko_to_en')}
              style={{ 
                padding: '0.6rem 1.2rem', borderRadius: '8px', border: '2px solid var(--primary)', 
                background: testMode === 'ko_to_en' ? 'var(--primary)' : 'transparent', 
                color: testMode === 'ko_to_en' ? '#fff' : 'var(--primary)', 
                cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                transition: 'all 0.2s'
              }}>
              뜻 보고 영단어 맞추기
            </button>
            <button 
              onClick={() => setTestMode('en_to_ko')}
              style={{ 
                padding: '0.6rem 1.2rem', borderRadius: '8px', border: '2px solid var(--primary)', 
                background: testMode === 'en_to_ko' ? 'var(--primary)' : 'transparent', 
                color: testMode === 'en_to_ko' ? '#fff' : 'var(--primary)', 
                cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                transition: 'all 0.2s'
              }}>
              영단어 보고 뜻 맞추기
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto' }}>
          {stages.length > 1 && stages.map((stageWords, idx) => (
             <button 
               key={idx} 
               className="btn-primary" 
               onClick={() => startTest(stageWords, idx)} 
               style={{ 
                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                 padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', 
                 border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' 
               }}
             >
               <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{idx + 1}단계</span>
               <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{stageWords.length} 문제</span>
             </button>
          ))}
          
          <button 
            className="btn-primary" 
            onClick={() => startTest(words, null)} 
            style={{ 
              display: 'flex', justifyContent: 'center', gap: '0.5rem', 
              padding: '1.2rem', marginTop: '1.5rem', background: 'var(--primary)',
              fontWeight: 'bold', fontSize: '1.1rem'
            }}
          >
            <Play size={22} fill="currentColor" /> 
            {stages.length > 1 ? `🔥 하드코어 모드 (${words.length}문제 전부 풀기)` : '테스트 시작하기'}
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const hasNextStage = currentStageIndex !== null && currentStageIndex + 1 < stages.length;

    return (
      <div className="glass-panel fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 className="app-title text-gradient">스테이지 클리어! 🎉</h2>
        <p style={{ fontSize: '1.5rem', margin: '2rem 0', color: 'var(--text-main)' }}>
          총 {testWords.length}문제 중 <strong style={{ color: 'var(--primary)', fontSize: '2.5rem', margin: '0 0.5rem' }}>{score}</strong>문제를 맞혔습니다!
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginTop: '2.5rem' }}>
          {hasNextStage ? (
            <>
              <button 
                className="btn-primary" 
                onClick={() => startTest(stages[currentStageIndex + 1], currentStageIndex + 1)} 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', padding: '1rem 2rem' }}
              >
                다음 {currentStageIndex + 2}단계 연속 진행 <ArrowRight size={22} />
              </button>
              <button 
                onClick={handleReturn} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem', fontSize: '1rem' }}
              >
                진행 멈추고 메뉴로 가기
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleReturn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <ArrowLeft size={20} /> 스테이지 목록으로 돌아가기
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentWord = testWords[currentIndex];

  return (
    <div className="glass-panel fade-in test-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="icon-btn" onClick={handleReturn} title="그만두고 뒤로가기">
          <ArrowLeft size={24} />
        </button>
        <div style={{ color: 'var(--primary)', letterSpacing: '2px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentStageIndex !== null && <span style={{ color: 'var(--text-main)', opacity: 0.8 }}>[{currentStageIndex + 1}단계]</span>}
          QUESTION {currentIndex + 1} OF {testWords.length}
        </div>
        <div style={{ width: 24 }}></div>
      </div>
      
      <div className="test-word text-gradient">
        {testMode === 'ko_to_en' ? currentWord.ko : currentWord.en}
      </div>

      <form className="test-input-group" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={testMode === 'ko_to_en' ? "영어 단어를 직접 입력하세요" : "한국어 뜻을 직접 입력하세요"}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={feedback !== null}
          autoFocus
          style={{ 
            borderColor: feedback === 'success' ? 'var(--success)' : feedback === 'error' ? 'var(--danger)' : 'var(--glass-border)',
            boxShadow: feedback ? 'none' : undefined,
            fontSize: '1.2rem'
          }}
        />
        <button type="submit" className="btn-primary" disabled={feedback !== null || !inputVal.trim()} style={{ minWidth: '100px', fontSize: '1.1rem' }}>
          확인
        </button>
      </form>

      <div className="feedback-text fade-in" style={{ visibility: feedback ? 'visible' : 'hidden' }}>
        {feedback === 'success' ? (
          <span className="feedback-success">정답입니다! 너무 잘 하셨어요 ✨</span>
        ) : (
          <span className="feedback-error">
            틀렸습니다! 오답 노트에 기록됩니다. 정답은 <strong>{testMode === 'ko_to_en' ? currentWord.en : currentWord.ko}</strong> 입니다.
          </span>
        )}
      </div>
    </div>
  );
}

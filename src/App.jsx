import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [timeline, setTimeline] = useState(() => {
    const saved = localStorage.getItem('timebox_timeline');
    return saved ? JSON.parse(saved) : {};
  })
  
  const [start, setStart] = useState(false)
  const [mode, setMode] = useState('study') 
  const [studyTime, setStudyTime] = useState(3000) 
  const [breakTime, setBreakTime] = useState(600) 
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const Time_slots = [
    '00:00 - 01:00','01:00 - 02:00','02:00 - 03:00','03:00 - 04:00',
    '04:00 - 05:00','05:00 - 06:00','06:00 - 07:00','07:00 - 08:00',
    '08:00 - 09:00','09:00 - 10:00','10:00 - 11:00','11:00 - 12:00',
    '12:00 - 13:00','13:00 - 14:00','14:00 - 15:00','15:00 - 16:00',
    '16:00 - 17:00','17:00 - 18:00','18:00 - 19:00','19:00 - 20:00',
    '20:00 - 21:00','21:00 - 22:00','22:00 - 23:00','23:00 - 24:00'
  ]

  useEffect(() => {
    localStorage.setItem('timebox_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    let timer;
    const currentTime = mode === 'study' ? studyTime : breakTime;

    if (start && isTimerRunning && currentTime > 0) {
      timer = setInterval(() => {
        if (mode === 'study') {
          setStudyTime((prev) => prev - 1);
        } else {
          setBreakTime((prev) => prev - 1);
        }
      }, 1000);
    } else if (currentTime === 0) {
      if (mode === 'study') {
        alert("공부 시간 끝!");
        setMode('break');
      } else {
        alert("쉬는 시간 끝!");
        setMode('study');
      }
      setIsTimerRunning(false);
    }

    return () => clearInterval(timer);
  }, [start, isTimerRunning, mode, studyTime, breakTime]);

  const handleClick = (slot) => {
    if (!selectedTask) {
      alert("먼저 할 일을 입력하세요")
      return;
    }

    setTimeline(prev => ({
      ...prev,
      [slot]: prev[slot] === selectedTask ? null : selectedTask
    }));
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopStudy = () => {
    if(window.confirm("공부를 종료하고 플래너로 돌아갈까요?")) {
      setStart(false);
      setStudyTime(3000);
      setBreakTime(600);
      setMode('study');
      setIsTimerRunning(false);
    }
  };

  const handleModeChange = (newMode) => {
    setIsTimerRunning(false);
    setMode(newMode);
  };

  if (start === true) {
    const displayTime = mode === 'study' ? studyTime : breakTime;

    return (
      <div className={`main-warp study-screen ${mode}-active`}>
        <header className='header'>
          <h1>Study Planner</h1>
        </header>

        <div className='card timer-card'>
          <div className='tab-container'>
            <button 
              onClick={() => handleModeChange('study')}
              className={`tab-btn ${mode === 'study' ? 'active' : ''}`}
            >
              공부 시간
            </button>
            <button 
              onClick={() => handleModeChange('break')}
              className={`tab-btn ${mode === 'break' ? 'active' : ''}`}
            >
              쉬는 시간
            </button>
          </div>

          <h2 className='process-title'>
            {mode === 'study' ? '집중 프로세스' : '휴식 프로세스'}
          </h2>
          
          <div className='timer-display'>
            {formatTime(displayTime)}
          </div>
          
          <div className='timer-buttons'>
            <button 
              onClick={() => setIsTimerRunning(!isTimerRunning)} 
              className={`button toggle-btn ${isTimerRunning ? 'running' : ''}`}
            >
              {isTimerRunning ? '일시정지' : '시작'}
            </button>
            <button 
              onClick={() => {
                if (mode === 'study') setStudyTime(3000);
                else setBreakTime(600);
                setIsTimerRunning(false);
              }} 
              className='button reset-btn'
            >
              시간 리셋
            </button>
          </div>
        </div>

        <div className='card monitor-card'>
          <h2>오늘의 시간표 확인</h2>
          <div className='timeslot readonly-mode'>
            {Time_slots.map((slot) => {
              if (!timeline[slot]) return null; 
              return (
                <div key={slot} className='slot active-slot'>
                  <span className='slotTime'>{slot}</span>
                  <span className='slotTask'>{timeline[slot]}</span>
                </div>
              );
            })}
            {Object.values(timeline).filter(Boolean).length === 0 && (
              <p className='empty-msg'>오늘 등록된 일정 계획이 없습니다.</p>
            )}
          </div>
        </div>

        <button onClick={handleStopStudy} className='confirm stop-btn'>
          공부 종료하기
        </button>
      </div>
    )
  }

  return (
    <div className='main-warp'>
      <header className='header'>
        <h1>Study Planner</h1>
      </header>

      <div className='card'>
        <h2>할일 지정!</h2>
        <div className='input-group'>
          <input 
            type='text' 
            placeholder='할 일 입력!' 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className='input'
          />
          <button onClick={() => setSelectedTask(task)} className='button select-btn'>선택</button>
        </div>
        {selectedTask && (
          <p className='action'>
            현재 선택된 할 일: <strong>{selectedTask}</strong> (아래 블록을 클릭하면 배치됩니다)
          </p>
        )}
      </div>

      <div className='card'>
        <h2>시간표 작성</h2>
        <div className='timeslot'>
          {Time_slots.map((slot) => (
            <div 
              key={slot} 
              onClick={() => handleClick(slot)}
              className={`slot ${timeline[slot] ? 'has-task' : ''}`}
            >
              <span className='slotTime'>{slot}</span>
              <span className='slotTask'>
                {timeline[slot] || '클릭해서 시간표 채우기'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => setStart(true)} className='confirm'>공부 시작하기!</button>
    </div>
  )
}

export default App
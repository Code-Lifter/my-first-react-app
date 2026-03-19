import React, { useState, useEffect, useRef } from 'react';

const DB_KEY = 'sidekickDataV3_react';

const initialData = {
  schedule: Array(18).fill({ time: '', text: '' }),
  priorities: ['', '', ''],
  notes: '',
  tasks: Array(15).fill({ state: 0, text: '' })
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? { ...initialData, ...JSON.parse(stored) } : initialData;
  });

  const dragItem = useRef();
  const dragOverItem = useRef();

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const resetDay = () => {
    if (window.confirm("Are you sure you want to clear the entire planner? This cannot be undone.")) {
      setData(initialData);
    }
  };

  // --- HANDLERS: SCHEDULE D&D ---
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.target.classList.add('dragging');
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    if (dragItem.current !== undefined && dragOverItem.current !== undefined) {
      const newSchedule = [...data.schedule];
      const draggedItemContent = newSchedule[dragItem.current];
      newSchedule.splice(dragItem.current, 1);
      newSchedule.splice(dragOverItem.current, 0, draggedItemContent);
      
      dragItem.current = null;
      dragOverItem.current = null;
      updateData('schedule', newSchedule);
    }
  };

  const updateScheduleItem = (index, field, value) => {
    const newSchedule = [...data.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    updateData('schedule', newSchedule);
  };

  // --- HANDLERS: TASKS ---
  const cycleTaskState = (index) => {
    const newTasks = [...data.tasks];
    newTasks[index].state = (newTasks[index].state + 1) % 3;
    updateData('tasks', newTasks);
  };

  const updateTaskText = (index, text) => {
    const newTasks = [...data.tasks];
    newTasks[index].text = text;
    updateData('tasks', newTasks);
  };

  const addNewTask = () => {
    updateData('tasks', [...data.tasks, { state: 0, text: '' }]);
  };

  // --- ICONS ---
  const getTaskIcon = (state) => {
    if (state === 0) return <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="fill-none"/>;
    if (state === 1) return (
      <>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="fill-none"/>
        <path d="M12 2 A10 10 0 0 1 12 22 Z" fill="currentColor"/>
      </>
    );
    return (
      <>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="fill-gray-900"/>
        <path d="M7 12L10 15L17 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="bg-white w-full max-w-[1400px] border-4 border-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-gray-800 border-b-4 border-gray-900 p-4 flex justify-between items-center">
          <div className="text-gray-500 font-bold tracking-[0.2em] text-xl">SIDEKICK</div>
          <button 
            onClick={resetDay} 
            className="text-xs font-bold text-gray-600 hover:text-red-400 border border-gray-600 hover:border-red-400 px-3 py-1 rounded transition-colors uppercase tracking-widest"
          >
            Reset Day
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-gray-900 h-full">
          
          {/* SCHEDULE */}
          <div className="lg:col-span-3 flex flex-col p-4 h-full min-h-[600px]">
            <h2 className="font-bold text-xs uppercase tracking-wider mb-2 border-b-2 border-gray-900 pb-1">Schedule</h2>
            <div className="flex-grow border-2 border-gray-900 rounded-sm p-2 relative">
              <div className="flex flex-col gap-1 h-full overflow-y-auto scroller">
                {data.schedule.map((item, index) => (
                  <div 
                    key={index} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 transition-colors draggable-item"
                  >
                    <div className="drag-handle text-gray-300 hover:text-gray-600 p-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="8" cy="4" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="8" cy="20" r="2" />
                        <circle cx="16" cy="4" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="16" cy="20" r="2" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      className="w-12 text-right bg-transparent text-gray-500 font-mono placeholder-gray-300 focus:text-black border-b border-transparent focus:border-gray-400" 
                      placeholder="00:00" 
                      value={item.time}
                      onChange={(e) => updateScheduleItem(index, 'time', e.target.value)}
                    />
                    <span className="text-gray-300">|</span>
                    <input 
                      type="text" 
                      className="flex-grow bg-transparent border-b border-gray-100 focus:border-gray-900 transition-colors" 
                      value={item.text}
                      onChange={(e) => updateScheduleItem(index, 'text', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRIORITIES & NOTES */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="p-4 flex-grow-0">
              <h2 className="font-bold text-xs uppercase tracking-wider mb-2 border-b-2 border-gray-900 pb-1">Daily Priorities</h2>
              <div className="flex flex-col gap-4 mt-2">
                {[1, 2, 3].map((num, i) => (
                  <div key={num} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center font-bold text-sm">{num}</div>
                    <input 
                      type="text" 
                      className="w-full border-b-2 border-gray-200 focus:border-gray-900 p-2 font-medium h-10 text-lg text-gray-800 transition-colors" 
                      placeholder={`Priority ${num}...`}
                      value={data.priorities[i]}
                      onChange={(e) => {
                        const newPrio = [...data.priorities];
                        newPrio[i] = e.target.value;
                        updateData('priorities', newPrio);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-4 border-gray-900"></div>

            <div className="p-4 flex-grow flex flex-col h-full min-h-[300px]">
              <h2 className="font-bold text-xs uppercase tracking-wider mb-2 border-b-2 border-gray-900 pb-1">Notes</h2>
              <textarea 
                className="w-full h-full p-4 border-none resize-none text-gray-800 leading-6 text-lg" 
                placeholder="Brain dump here..."
                value={data.notes}
                onChange={(e) => updateData('notes', e.target.value)}
              />
            </div>
          </div>

          {/* TASKS */}
          <div className="lg:col-span-4 flex flex-col p-4 h-full min-h-[600px]">
            <h2 className="font-bold text-xs uppercase tracking-wider mb-2 border-b-2 border-gray-900 pb-1">Tasks</h2>
            <div className="flex flex-col gap-3 h-full overflow-y-auto scroller pb-2">
              {data.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => cycleTaskState(index)} 
                    className="flex-shrink-0 focus:outline-none transition-transform hover:scale-110 text-gray-900 w-6 h-6"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {getTaskIcon(task.state)}
                    </svg>
                  </button>
                  <input 
                    type="text" 
                    className={`w-full border-b border-gray-200 focus:border-gray-900 p-1 px-2 text-sm transition-all ${
                      task.state === 2 ? 'line-through text-gray-400 bg-gray-50' : 
                      task.state === 1 ? 'text-gray-900 font-semibold' : 'text-gray-800 bg-white'
                    }`} 
                    value={task.text}
                    onChange={(e) => updateTaskText(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={addNewTask} 
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-wide text-center w-full py-3 border-2 border-dashed border-gray-200 hover:border-gray-900 transition-colors"
            >
              + Add Task Row
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
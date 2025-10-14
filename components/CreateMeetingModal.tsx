import React, { useState, useCallback, useEffect } from 'react';
import type { User, SuggestedSlot } from '../types';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onMeetingProposed: (slot: SuggestedSlot, title: string) => void;
  currentWeekStartDate: Date;
}

const toInputDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, users, onMeetingProposed, currentWeekStartDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toInputDateString(currentWeekStartDate));
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const resetStateAndClose = useCallback(() => {
    setTitle('');
    setDate(toInputDateString(new Date()));
    setTime('10:00');
    setDuration(60);
    setError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!title || !date || !time || users.length === 0) {
      setError("Please provide a title, date, time, and select at least one user.");
      return;
    }
    setError(null);

    try {
        const startTime = new Date(`${date}T${time}`);
        if (isNaN(startTime.getTime())) {
            throw new Error("Invalid date or time format.");
        }
        
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        const slot: SuggestedSlot = {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        };

        onMeetingProposed(slot, title);
        resetStateAndClose();

    } catch(e) {
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
    }
  }, [title, date, time, duration, users, onMeetingProposed, resetStateAndClose]);

  useEffect(() => {
    if (isOpen) {
      setDate(toInputDateString(currentWeekStartDate));
    }
  }, [isOpen, currentWeekStartDate]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2d3748] border border-blue-500 rounded-lg p-6 w-full max-w-lg text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create a New Meeting</h2>
          <button onClick={resetStateAndClose} className="text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-semibold">Meeting Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              placeholder="e.g., Project Phoenix Sync"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block mb-1 font-semibold">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
            <div>
              <label htmlFor="time" className="block mb-1 font-semibold">Start Time</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block mb-1 font-semibold">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
              step="15"
              min="15"
            />
          </div>

          <div className="p-2 border border-dashed border-gray-500 rounded">
            <h4 className="font-semibold">Selected Users:</h4>
            <p className="text-sm text-gray-300">{users.map(u => u.name).join(', ') || 'None'}</p>
          </div>
        
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}

          <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 p-2 rounded font-bold mt-4">
            Propose Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

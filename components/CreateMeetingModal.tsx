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

function makeDraggable(element: HTMLElement | null): void {
   // Ensure the element exists before proceeding.
   if (!element) {
     console.error("Draggable element not found. Please check the ID.");
     return;
   }

   let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

   // Use the header element for dragging (we added it to the JSX)
   const dragHandle = document.getElementById(`${element.id}header`) || element;

   if (!dragHandle) {
     console.error("Drag handle not found. Expected element with ID:", `${element.id}header`);
     return;
   }

   // Attach the initial mouse down event to the drag handle.
   dragHandle.onmousedown = dragMouseDown;

  /**
   * This function is called when the user clicks the mouse down on the drag handle.
   * @param e The MouseEvent object.
   */
  function dragMouseDown(e: MouseEvent): void {
    // Prevent default browser actions for the event (e.g., text selection).
    e.preventDefault();

    // Get the initial position of the mouse cursor.
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Set up listeners for when the mouse moves or the button is released.
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  /**
   * This function is called whenever the mouse cursor moves while the button is held down.
   * @param e The MouseEvent object.
   */
  function elementDrag(e: MouseEvent): void {
    e.preventDefault();

    // Calculate the distance the mouse has moved since the last call.
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Update the element's position by the same distance the mouse moved.
    let newTop = element.offsetTop - pos2;
    let newLeft = element.offsetLeft - pos1;

    // Keep the element within viewport bounds
    const maxTop = window.innerHeight - element.offsetHeight;
    const maxLeft = window.innerWidth - element.offsetWidth;

    newTop = Math.max(0, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;
  }

  /**
   * This function is called when the user releases the mouse button.
   */
  function closeDragElement(): void {
    // Stop tracking mouse movement by removing the event listeners.
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, users, onMeetingProposed, currentWeekStartDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toInputDateString(currentWeekStartDate));
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [includeJitsiMeet, setIncludeJitsiMeet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize draggable functionality when modal opens
  useEffect(() => {
    if (isOpen) {
      const element = document.getElementById("mydiv");
      if (element) {
        makeDraggable(element);
      }
    }
  }, [isOpen]);

  const resetStateAndClose = useCallback(() => {
    setTitle('');
    setDate(toInputDateString(new Date()));
    setTime('10:00');
    setDuration(60);
    setIncludeJitsiMeet(false);
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
             includeGoogleMeet: includeJitsiMeet,
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div id="mydiv" className="bg-[#2d3748] absolute border border-blue-500 rounded-lg p-6 w-full max-w-lg text-white">
        <div id="mydivheader" className="cursor-move flex justify-between items-center mb-4">
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

          <div className="flex gap-4 items-end">
            <div className="flex-1">
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
            <label htmlFor={includeJitsiMeet} className="flex items-center cursor-pointer mb-3">
              <div className="relative">
                <input
                  id="includeJitsiMeet"
                  type="checkbox"
                  className="sr-only"
                  checked={includeJitsiMeet}
                  onChange={(e) => setIncludeJitsiMeet(e.target.checked)}
                />
                <div className={`w-6 h-6 border-2 rounded border-gray-600 bg-gray-400`}>
                  {includeJitsiMeet && (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`ml-3 font-semibold text-large`}>
                Jitsi Meet
              </span>
            </label>
            
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

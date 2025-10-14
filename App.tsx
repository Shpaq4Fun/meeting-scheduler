import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserSelection } from './components/UserSelection';
import { Controls } from './components/Controls';
import { CalendarView } from './components/CalendarView';
import { CreateMeetingModal } from './components/CreateMeetingModal';
import { USERS } from './constants';
import { fetchEventsForUsers } from './services/googleCalendarService';
import { initClient, signIn, getAccessToken } from './services/googleAuthService';
import type { User, CalendarEvent, SuggestedSlot } from './types';

const App: React.FC = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['user-1', 'user-4', 'user-5']);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposedMeeting, setProposedMeeting] = useState<CalendarEvent | null>(null);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(new Date());
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    // Initialize Google API client
    initClient().then(() => {
      // Check if we have a valid access token
      const token = getAccessToken();
      setIsSignedIn(!!token);
    }).catch((error) => {
      console.error('Google API initialization failed:', error);
      setIsSignedIn(false);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      await signIn();
      // Check if we got an access token
      const token = getAccessToken();
      setIsSignedIn(!!token);
    } catch (error) {
      console.error('Sign-in failed:', error);
      setIsSignedIn(false);
    }
  };

  const selectedUsers = useMemo(() => {
    return USERS.filter(user => selectedUserIds.includes(user.id));
  }, [selectedUserIds]);

  // Initialize with empty events - real data will be loaded when user clicks Generate Calendar

  const handleUserToggle = useCallback((userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    setProposedMeeting(null); // Clear proposed meeting if user selection changes
  }, []);

  const handleGenerateCalendar = useCallback(async () => {
    try {
      console.log('Fetching calendar events for users:', selectedUsers.map(u => u.name));
      const visibleEvents = await fetchEventsForUsers(selectedUsers, currentWeekStartDate);
      console.log('Successfully fetched calendar data:', visibleEvents.length, 'events');
      setEvents(visibleEvents);
      setProposedMeeting(null);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status,
        code: (error as any)?.code
      });
      // Show empty state when API fails
      setEvents([]);
      setProposedMeeting(null);
    }
  }, [selectedUsers, currentWeekStartDate]);
  
  const handleMeetingProposed = useCallback((slot: SuggestedSlot, title: string) => {
    const newMeeting: CalendarEvent = {
      id: `meeting-${Date.now()}`,
      title: title,
      start: new Date(slot.startTime),
      end: new Date(slot.endTime),
      userId: 'meeting-proposal', // Special ID for proposed meetings
    };
    setProposedMeeting(newMeeting);
    setEvents(prev => [...prev.filter(e => e.id !== (proposedMeeting?.id || '')), newMeeting]);
    setIsModalOpen(false);
  },[proposedMeeting]);

  const handleSendInvitation = useCallback(() => {
    if (proposedMeeting) {
      alert(`Invitation sent for "${proposedMeeting.title}"!`);
      // In a real app, this would call an API.
      // For this demo, we'll "confirm" the meeting by changing its user ID and making it permanent
      const confirmedMeeting = { ...proposedMeeting, userId: 'confirmed-meeting' };
      setEvents(prev => [...prev.filter(e => e.id !== proposedMeeting.id), confirmedMeeting]);
      setProposedMeeting(null);
    } else {
      alert("Please create and propose a meeting first.");
    }
  }, [proposedMeeting]);

  return (
    <div className="bg-[#1a202c] text-gray-200 p-2 font-sans flex-col flex-row">
      {/* <div className="border h-full border-blue-600 rounded-lg p-4 bg-[#1a202c]"> */}
        
        <div className="flex flex-col md:flex-row gap-2 h-full">
          {/* Left Sidebar */}
          <aside className="w-full md:w-1/5 flex flex-col gap-3">
            <h2 className="text-2xl font-bold mb-3 text-gray-100" style={{textAlignLast: 'center'}}>Meeting planner</h2>

            {/* Always show user selection */}
            <UserSelection users={USERS} selectedUserIds={selectedUserIds} onUserToggle={handleUserToggle} />

            {/* Show controls but disable when not signed in */}
            <Controls
              onGenerateCalendar={handleGenerateCalendar}
              onCreateMeeting={() => setIsModalOpen(true)}
              onSendInvitation={handleSendInvitation}
              isInvitationDisabled={!proposedMeeting || !isSignedIn}
              isGenerateDisabled={!isSignedIn}
            />

            {/* Show sign-in button when not signed in */}
            {!isSignedIn && (
              <button onClick={handleSignIn} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In with Google
              </button>
            )}
            {isSignedIn && (
              <div className="bg-green-600 text-white font-bold py-2 px-4 rounded text-center">
                ✅ Authenticated with Google
              </div>
            )}
          </aside>

          {/* Right Content */}
          <main className="w-full md:w-4/5 flex-row">
            <CalendarView events={events} users={USERS} startDate={currentWeekStartDate} setStartDate={setCurrentWeekStartDate} />
          </main>
        </div>
      {/* </div> */}
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={selectedUsers}
        onMeetingProposed={handleMeetingProposed}
        currentWeekStartDate={currentWeekStartDate}
      />
    </div>
  );
};

export default App;

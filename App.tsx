import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UserSelection } from './components/UserSelection';
import { Controls } from './components/Controls';
import { CalendarView } from './components/CalendarView';
import { CreateMeetingModal } from './components/CreateMeetingModal';
import { USERS } from './constants';
import { fetchEventsForUsers, createCalendarEvent, deleteCalendarEvent } from './services/googleCalendarService';
import { suggestMeetingTimes } from './services/geminiService';
import { initClient, signIn, getAccessToken } from './services/googleAuthService';
import type { User, CalendarEvent, SuggestedSlot } from './types';

const App: React.FC = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(['user-0']);
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

  // handleSignIn();

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
      console.log('Week start date:', currentWeekStartDate);
      const visibleEvents = await fetchEventsForUsers(selectedUsers, currentWeekStartDate);
      console.log('Successfully fetched calendar data:', visibleEvents.length, 'events');
      console.log('Events by user:', visibleEvents.reduce((acc, event) => {
        acc[event.userId] = (acc[event.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
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

  const handleProposeMeeting = useCallback((slot: SuggestedSlot, title: string) => {
    // suggestMeetingTimes(schedules, durationMinutes, prompt, weekStartDate)
    setProposedMeeting([]);
  },[proposedMeeting]);

  const handleCreateOrDeleteMeeting = useCallback(async () => {
    // Check if there's a proposed meeting to delete
    if (proposedMeeting) {
      try {
        // Check if this is a confirmed meeting (has real Google Calendar event ID)
        if (proposedMeeting.userId === 'confirmed-meeting' && proposedMeeting.id.startsWith('confirmed-') === false) {
          // This is a real Google Calendar event, delete it from Google Calendar too
          const dmcUser = USERS.find(user => user.id === 'user-0');
          if (dmcUser && dmcUser.invitationCalId) {
            await deleteCalendarEvent(proposedMeeting.id, dmcUser.invitationCalId);
            console.log('Confirmed meeting deleted from Google Calendar');
          }
        }

        // Delete the meeting from local state
        setEvents(prev => prev.filter(e => e.id !== proposedMeeting.id));
        setProposedMeeting(null);
        console.log('Meeting deleted successfully');

      } catch (error) {
        console.error('Failed to delete meeting:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`❌ Failed to delete meeting:\n\n${errorMessage}\n\nPlease check the console for more details.`);
      }
    } else {
      // Check if there are any confirmed meetings to delete
      const confirmedMeetings = events.filter(e => e.userId === 'confirmed-meeting');
      if (confirmedMeetings.length > 0) {
        try {
          const meetingToDelete = confirmedMeetings[0]; // Delete the first confirmed meeting
          const dmcUser = USERS.find(user => user.id === 'user-0');
          if (dmcUser && dmcUser.invitationCalId) {
            await deleteCalendarEvent(meetingToDelete.id, dmcUser.invitationCalId);
            console.log('Confirmed meeting deleted from Google Calendar');
          }

          // Delete the meeting from local state
          setEvents(prev => prev.filter(e => e.id !== meetingToDelete.id));
          console.log('Confirmed meeting deleted successfully');

        } catch (error) {
          console.error('Failed to delete confirmed meeting:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          alert(`❌ Failed to delete confirmed meeting:\n\n${errorMessage}\n\nPlease check the console for more details.`);
        }
      } else {
        // No proposed or confirmed meetings, open modal to create new meeting
        setIsModalOpen(true);
      }
    }
  }, [proposedMeeting, events]);

  const handleSendInvitation = useCallback(async () => {
    if (proposedMeeting) {
      try {
        // Get attendee email addresses from selected users
        const attendeeEmails = selectedUsers
          .filter(user => user.invitationCalId)
          .map(user => user.invitationCalId!);

        if (attendeeEmails.length === 0) {
          alert("No attendees found. Please ensure users have invitation email addresses configured.");
          return;
        }

        // Use DMC calendar (user-0) for creating the event
        const dmcUser = USERS.find(user => user.id === 'user-0');
        if (!dmcUser || !dmcUser.invitationCalId) {
          alert("DMC calendar not properly configured. Please check user settings.");
          return;
        }

        console.log('Sending invitations for meeting:', {
          title: proposedMeeting.title,
          attendees: attendeeEmails,
          calendarId: dmcUser.invitationCalId
        });

        // Create the calendar event and send invitations
        const createdEvent = await createCalendarEvent(
          {
            title: proposedMeeting.title,
            start: proposedMeeting.start,
            end: proposedMeeting.end,
            description: `Meeting scheduled via DMC Meeting Scheduler with ${selectedUsers.map(u => u.name).join(', ')}`
          },
          attendeeEmails,
          dmcUser.invitationCalId
        );

        // Update UI to show the meeting as confirmed
        const confirmedMeeting = {
          ...proposedMeeting,
          id: createdEvent.id || `confirmed-${Date.now()}`,
          userId: 'confirmed-meeting'
        };

        setEvents(prev => [...prev.filter(e => e.id !== proposedMeeting.id), confirmedMeeting]);
        setProposedMeeting(null);

        // Show success message with event details
        alert(`✅ Invitation sent successfully!\n\nMeeting: "${proposedMeeting.title}"\nTime: ${proposedMeeting.start.toLocaleString()}\nAttendees: ${selectedUsers.map(u => u.name).join(', ')}\n\nParticipants will receive calendar invitations via email.`);

      } catch (error) {
        console.error('Failed to send invitation:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`❌ Failed to send invitation:\n\n${errorMessage}\n\nPlease check the console for more details.`);
      }
    } else {
      alert("Please create and propose a meeting first.");
    }
  }, [proposedMeeting, selectedUsers]);

  return (
    <div className="bg-[#1a202c] text-gray-200 p-2 font-sans flex-col flex-row">
      {/* <div className="border h-full border-blue-600 rounded-lg p-4 bg-[#1a202c]"> */}
        
        <div className="flex flex-col md:flex-row gap-3 h-full">
          {/* Left Sidebar */}
          <aside className="w-full md:w-1/5 flex flex-col gap-4">
            <h2 className="text-3xl font-bold mt-2 mb-1 text-gray-100" style={{textAlignLast: 'center'}}>DMC Meeting Planner</h2>
            <p className="text-sm">1. Sign in with Google account (required for GCal apps)</p>
            <p className="-mt-4 text-sm">2. Select users for the meeting and the correct week. App will import events from their teaching calendars.</p>
            <p className="-mt-4 text-sm">3. Generate a calendar for the selected users.</p>
            <p className="-mt-4 text-sm">4. Based on free areas create a meeting proposition.</p>
            <p className="-mt-4 text-sm">5. Send invitations to the created meeting to selected users.</p>
            {/* Always show user selection */}
            <UserSelection users={USERS} selectedUserIds={selectedUserIds} onUserToggle={handleUserToggle} />

            {/* Show controls but disable when not signed in */}
            <Controls
              onGenerateCalendar={handleGenerateCalendar}
              onCreateMeeting={handleCreateOrDeleteMeeting}
              onProposeMeeting={handleProposeMeeting}
              onSendInvitation={handleSendInvitation}
              isInvitationDisabled={!proposedMeeting || !isSignedIn}
              isGenerateDisabled={!isSignedIn}
              hasProposedMeeting={!!proposedMeeting}
              hasConfirmedMeeting={events.some(e => e.userId === 'confirmed-meeting')}
            />

            {/* Show sign-in button when not signed in */}
            {!isSignedIn && (
              <button onClick={handleSignIn} className="bg-blue-500 py-3 text-xl hover:bg-blue-700 transition duration-300 text-white font-bold px-4 rounded-lg">
                Sign In with Google
              </button>
            )}
            {isSignedIn && (
              <div className="bg-green-600 py-3 text-xl text-white font-bold px-4 rounded-lg text-center">
                ✅ Authenticated
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

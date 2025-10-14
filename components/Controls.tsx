
import React from 'react';
import { Button } from './Button';

interface ControlsProps {
  onGenerateCalendar: () => void;
  onCreateMeeting: () => void;
  onSendInvitation: () => void;
  isInvitationDisabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onGenerateCalendar, onCreateMeeting, onSendInvitation, isInvitationDisabled }) => {
  return (
    <div className="border border-blue-500 rounded-lg p-4 bg-gray-700/50">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Controls</h2>
      <div className="flex flex-col gap-3">
        <Button onClick={onGenerateCalendar}>Generate Calendar</Button>
        <Button onClick={onCreateMeeting}>Create Meeting</Button>
        <Button onClick={onSendInvitation} disabled={isInvitationDisabled}>
          Send Invitation
        </Button>
      </div>
    </div>
  );
};

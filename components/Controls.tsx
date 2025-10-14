
import React from 'react';
import { Button } from './Button';

interface ControlsProps {
  onGenerateCalendar: () => void;
  onCreateMeeting: () => void;
  onSendInvitation: () => void;
  isInvitationDisabled: boolean;
  isGenerateDisabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onGenerateCalendar,
  onCreateMeeting,
  onSendInvitation,
  isInvitationDisabled,
  isGenerateDisabled
}) => {
  return (
    <div className="flex flex-col gap-2 p-1 rounded-lg bg-gray-800">
      <Button onClick={onGenerateCalendar} disabled={isGenerateDisabled}>
        {isGenerateDisabled ? 'Sign in to Generate Calendar' : 'Generate Calendar'}
      </Button>
      <Button onClick={onCreateMeeting} disabled={isGenerateDisabled}>
        {isGenerateDisabled ? 'Sign in to Create Meeting' : 'Create Meeting'}
      </Button>
      <Button onClick={onSendInvitation} disabled={isInvitationDisabled}>
        {isInvitationDisabled ? 'Create a meeting first' : 'Send Invitation'}
      </Button>
    </div>
  );
};


import React from 'react';
import { Button } from './Button';

interface ControlsProps {
  onGenerateCalendar: () => void;
  onCreateMeeting: () => void;
  onProposeMeeting: () => void;
  onSendInvitation: () => void;
  isInvitationDisabled: boolean;
  isGenerateDisabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onGenerateCalendar,
  onCreateMeeting,
  onProposeMeeting,
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
      <Button onClick={onProposeMeeting} disabled={isGenerateDisabled}>
        {isGenerateDisabled ? 'Sign in to Propose Meeting' : 'Propose Meeting'}
      </Button>
      <Button onClick={onSendInvitation} disabled={isInvitationDisabled}>
        {isInvitationDisabled ? 'Create a meeting to send an invitation' : 'Send Invitation'}
      </Button>
    </div>
  );
};

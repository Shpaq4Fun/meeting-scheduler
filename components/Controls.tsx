
import React from 'react';
import { Button } from './Button';

interface ControlsProps {
  onGenerateCalendar: () => void;
  onCreateMeeting: () => void;
  onProposeMeeting: () => void;
  onSendInvitation: () => void;
  isInvitationDisabled: boolean;
  isGenerateDisabled?: boolean;
  hasProposedMeeting?: boolean;
  hasConfirmedMeeting?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onGenerateCalendar,
  onCreateMeeting,
  onProposeMeeting,
  onSendInvitation,
  isInvitationDisabled,
  isGenerateDisabled,
  hasProposedMeeting = false,
  hasConfirmedMeeting = false
}) => {
  return (
    <div className="flex flex-col gap-1 p-0 rounded-lg bg-[#1a202c]/0">
      {/* <Button onClick={onGenerateCalendar} disabled={isGenerateDisabled} className="text-3xl">
        {isGenerateDisabled ? 'Sign in to Generate Calendar' : 'Generate Calendar'}
      </Button> */}
      <Button style={{borderRadius: 25 + 'px'}} onClick={onCreateMeeting} disabled={isGenerateDisabled}>
        {isGenerateDisabled
          ? 'Sign in to Create Meeting'
          : hasConfirmedMeeting
            ? 'Delete Confirmed Meeting'
            : hasProposedMeeting
              ? 'Delete Proposed Meeting'
              : 'Create Meeting'
        }
      </Button>
      {/* <Button onClick={onProposeMeeting} disabled={isGenerateDisabled}>
        {isGenerateDisabled ? 'Sign in to Propose Meeting' : 'Propose Meeting'}
      </Button> */}
      <Button style={{borderRadius: 25 + 'px'}} onClick={onSendInvitation} disabled={isInvitationDisabled}>
        {isInvitationDisabled ? 'Create a meeting to invite' : 'Send Invitation'}
      </Button>
    </div>
  );
};


import React from 'react';
import { Button } from './Button';
import { USE_MOCK_AUTH, USE_REAL_DATA } from '../constants';

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
        {USE_MOCK_AUTH && !USE_REAL_DATA
          ? 'Generate Calendar (Mock Data)'
          : USE_REAL_DATA
            ? 'Generate Calendar (Real Data)'
            : isGenerateDisabled
              ? 'Sign in to Generate Calendar'
              : 'Generate Calendar'
        }
      </Button>
      <Button onClick={onCreateMeeting} disabled={isGenerateDisabled}>
        {USE_MOCK_AUTH
          ? 'Create Meeting (Mock Mode)'
          : isGenerateDisabled
            ? 'Sign in to Create Meeting'
            : 'Create Meeting'
        }
      </Button>
      <Button onClick={onSendInvitation} disabled={isInvitationDisabled}>
        {isInvitationDisabled ? 'Create a meeting first' : 'Send Invitation'}
      </Button>
    </div>
  );
};

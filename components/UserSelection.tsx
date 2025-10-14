
import React from 'react';
import type { User } from '../types';
import { Checkbox } from './Checkbox';

interface UserSelectionProps {
  users: User[];
  selectedUserIds: string[];
  onUserToggle: (userId: string) => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ users, selectedUserIds, onUserToggle }) => {
  return (
    <div className="border border-blue-500 rounded-lg p-4 bg-gray-700/50">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">DMC Members</h2>
      <div className="flex flex-col gap-1">
        {users.map(user => (
          <Checkbox
            key={user.id}
            id={user.id}
            label={user.name}
            checked={selectedUserIds.includes(user.id)}
            onChange={() => onUserToggle(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

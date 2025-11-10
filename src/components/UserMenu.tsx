import { useSession, signOut } from '../lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

/**
 * User Menu Component
 * Displays user info and logout button
 */
export function UserMenu() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/auth/login' });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="font-medium text-gray-900">{session.user.name}</p>
        <p className="text-gray-500">{session.user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign out
      </button>
    </div>
  );
}

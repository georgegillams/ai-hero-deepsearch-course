import { signIn } from "next-auth/react";
import { siDiscord } from "simple-icons/icons";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDismissible?: boolean;
}

export const SignInModal = ({
  isOpen,
  onClose,
  isDismissible = true,
}: SignInModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-gray-900 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-200">
          Sign in required
        </h2>
        <p className="mb-6 text-gray-400">
          {isDismissible
            ? "Please sign in to continue your conversation."
            : "You must sign in to use this application."}
        </p>
        <div className="flex justify-end gap-3">
          {isDismissible && (
            <button
              onClick={onClose}
              className="rounded px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => void signIn("discord")}
            className="flex items-center gap-2 rounded bg-[#5865F2] px-4 py-2 text-white hover:bg-[#4752C4] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d={siDiscord.path} />
            </svg>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

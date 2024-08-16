import React from "react";
import { useSelector } from "react-redux";

export default function UserAssistancePage() {
  const { currentUser } = useSelector((state) => state.user);

  // If the user is an admin, return null to hide the component
  if (currentUser.isAdmin) {
    return null;
  }

  return (
    <div className="pt-8 px-4 flex justify-center items-start min-h-screen">
      <div className="p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800 w-full max-w-md">
        <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Amount of Assistance:
        </h2>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {currentUser.amountOfAssistance !== undefined
              ? `₱ ${currentUser.amountOfAssistance}`
              : "No assistance amount available"}
          </p>
        </div>
      </div>
    </div>
  );
}

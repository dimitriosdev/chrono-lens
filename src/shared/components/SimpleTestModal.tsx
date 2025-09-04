"use client";

import React from "react";

interface SimpleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleTestModal: React.FC<SimpleTestModalProps> = ({
  isOpen,
  onClose,
}) => {
  console.log("SimpleTestModal render:", isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Test Modal</h2>
        <p className="mb-4">
          This is a test modal to check if modals work at all.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SimpleTestModal;

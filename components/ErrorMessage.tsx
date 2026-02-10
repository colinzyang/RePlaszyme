import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-2xl">error</span>
                <div>
                    <p className="font-semibold text-base">Error</p>
                    <p className="text-sm mt-1">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;

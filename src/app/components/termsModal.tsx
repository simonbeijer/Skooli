"use client";

import { useState } from "react";
import Modal from "@/app/components/modal";
import Button from "@/app/components/button";
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showClose?: boolean;
  projectName?: string;
  onTermsAccepted?: () => void;
  customTermsContent?: React.ReactNode;
  customPrivacyContent?: React.ReactNode;
}

interface CheckboxFieldProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  required?: boolean;
}

const CheckboxField = ({ id, checked, onChange, children, required }: CheckboxFieldProps) => (
  <label className="flex items-start space-x-3 cursor-pointer group" htmlFor={id}>
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-4 h-4 text-primary bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500 rounded focus:ring-primary focus:ring-2 transition-colors"
      required={required}
    />
    <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
      {children}
    </span>
  </label>
);

interface NoticeCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: 'warning' | 'info';
}

const NoticeCard = ({ icon, title, children, variant = 'info' }: NoticeCardProps) => {
  const variantClasses = {
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="text-sm text-left pt-1">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</p>
          <div className="text-gray-600 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsModal = ({ 
  isOpen, 
  onClose, 
  showClose = true,
  projectName = 'Template',
  onTermsAccepted,
  customTermsContent,
  customPrivacyContent
}: TermsModalProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const canProceed = termsAccepted && privacyAccepted;

  const handleAcceptTerms = () => {
    if (canProceed) {
      // Store acceptance in localStorage with project-specific key
      const storageKey = `${projectName.toLowerCase().replace(/\s+/g, '-')}-terms-accepted`;
      localStorage.setItem(storageKey, new Date().toISOString());
      
      // Call custom handler if provided
      if (onTermsAccepted) {
        onTermsAccepted();
      }
      
      onClose();
    }
  };

  const handleModalClose = () => {
    // Reset form state when modal closes
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleModalClose} 
      showClose={showClose}
      title="Terms of Use & Privacy Notice"
      size="xl"
      closeOnBackdropClick={false}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Disclaimer Section */}
        <NoticeCard
          variant="warning"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />}
          title="Important Disclaimer"
        >
          {customTermsContent || (
            <p>
              This application provides web services and functionality. Use at your own risk. 
              We bear no responsibility for any outcomes or consequences arising from the use of this service. 
              Always verify information and use your own judgment when making decisions.
            </p>
          )}
        </NoticeCard>

        {/* Privacy Notice Section */}
        <NoticeCard
          variant="info"
          icon={<InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          title="Data Processing Notice"
        >
          {customPrivacyContent || (
            <p>
              This service processes user data to provide functionality. Your information 
              may be stored and processed according to our privacy policies. 
              Please avoid sharing sensitive personal information.
            </p>
          )}
        </NoticeCard>

        {/* Consent Checkboxes */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
          <CheckboxField
            id="terms-checkbox"
            checked={termsAccepted}
            onChange={setTermsAccepted}
            required
          >
            I agree to the Terms of Service and acknowledge the limitations and disclaimers stated above. 
            I understand this service is provided as-is.
          </CheckboxField>

          <CheckboxField
            id="privacy-checkbox"
            checked={privacyAccepted}
            onChange={setPrivacyAccepted}
            required
          >
            I consent to the processing of my data as described above and understand that my information 
            will be processed by this service to provide the requested functionality.
          </CheckboxField>
        </div>

        {/* Accept Button */}
        <div className="text-center pt-4">
          <Button
            variant={canProceed ? "primary" : "secondary"}
            size="lg"
            callBack={handleAcceptTerms}
            disabled={!canProceed}
            className="min-w-[200px]"
          >
            {canProceed ? "Accept & Continue" : "Please accept terms to continue"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TermsModal;
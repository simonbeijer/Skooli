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
      className="mt-1 w-4 h-4 text-[#3E8E7E] bg-white border-[#E6F2F1] rounded focus:ring-[#3E8E7E] focus:ring-2 transition-colors"
      required={required}
    />
    <span className="text-sm font-inter text-[#1C1C1C] group-hover:text-[#333] transition-colors">
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
    warning: 'bg-[#88C9BF]/10 border-[#88C9BF]/30',
    info: 'bg-[#A4D4AE]/10 border-[#A4D4AE]/30'
  };

  return (
    <div className={`border rounded-3xl p-6 ${variantClasses[variant]} backdrop-blur-sm`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {icon}
        </div>
        <div className="text-sm text-left pt-1 font-inter">
          <p className="font-semibold text-[#1C1C1C] mb-2">{title}</p>
          <div className="text-[#333] leading-relaxed">
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
      title="Användarvillkor & Integritetspolicy"
      size="xl"
      closeOnBackdropClick={false}
    >
      <div className="max-w-4xl mx-auto space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg relative z-20">
        {/* Disclaimer Section */}
        <NoticeCard
          variant="warning"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-[#3E8E7E]" />}
          title="Viktig Information"
        >
          {customTermsContent || (
            <p>
              Denna applikation tillhandahåller webbtjänster och funktionalitet. Använd på egen risk. 
              Vi tar inget ansvar för eventuella resultat eller konsekvenser som uppstår från användningen av denna tjänst. 
              Verifiera alltid information och använd ditt eget omdöme när du fattar beslut.
            </p>
          )}
        </NoticeCard>

        {/* Privacy Notice Section */}
        <NoticeCard
          variant="info"
          icon={<InformationCircleIcon className="h-5 w-5 text-[#3E8E7E]" />}
          title="Databehandlingsmeddelande"
        >
          {customPrivacyContent || (
            <p>
              Denna tjänst behandlar användardata för att tillhandahålla funktionalitet. Din information 
              kan lagras och behandlas enligt våra integritetspolicyer. 
              Vänligen undvik att dela känslig personlig information.
            </p>
          )}
        </NoticeCard>

        {/* Consent Checkboxes */}
        <div className="space-y-4 mb-6 p-6 bg-[#F0F7F6] rounded-3xl border border-[#E6F2F1]">
          <CheckboxField
            id="terms-checkbox"
            checked={termsAccepted}
            onChange={setTermsAccepted}
            required
          >
            Jag godkänner användarvillkoren och erkänner begränsningarna och ansvarsfriskrivningarna som anges ovan. 
            Jag förstår att denna tjänst tillhandahålls i befintligt skick.
          </CheckboxField>

          <CheckboxField
            id="privacy-checkbox"
            checked={privacyAccepted}
            onChange={setPrivacyAccepted}
            required
          >
            Jag samtycker till behandlingen av mina data enligt beskrivningen ovan och förstår att min information 
            kommer att behandlas av denna tjänst för att tillhandahålla den begärda funktionaliteten.
          </CheckboxField>
        </div>

        {/* Accept Button */}
        <div className="text-center pt-4">
          <Button
            variant={canProceed ? "primary" : "outline"}
            size="lg"
            callBack={handleAcceptTerms}
            disabled={!canProceed}
            className="min-w-[200px]"
          >
            {canProceed ? "Acceptera & Fortsätt" : "Vänligen acceptera villkoren för att fortsätta"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TermsModal;
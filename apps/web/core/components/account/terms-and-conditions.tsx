import React from "react";
import Link from "next/link";
import { EAuthModes } from "@plane/constants";

interface TermsAndConditionsProps {
  authType?: EAuthModes;
}

// Constants for better maintainability
const LEGAL_LINKS = {
  termsOfService: "https://plane.so/legals/terms-and-conditions",
  privacyPolicy: "https://plane.so/legals/privacy-policy",
} as const;

const MESSAGES = {
  [EAuthModes.SIGN_UP]: "Hesap oluşturarak",
  [EAuthModes.SIGN_IN]: "Giriş yaparak",
} as const;

// Reusable link component to reduce duplication
function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-secondary" target="_blank" rel="noopener noreferrer">
      <span className="text-13 font-medium underline hover:cursor-pointer">{children}</span>
    </Link>
  );
}

export function TermsAndConditions({ authType = EAuthModes.SIGN_IN }: TermsAndConditionsProps) {
  return (
    <div className="flex items-center justify-center">
      <p className="text-center text-13 text-tertiary whitespace-pre-line">
        {`${MESSAGES[authType]}, \n `}
        <LegalLink href={LEGAL_LINKS.termsOfService}>Hizmet Koşulları</LegalLink> ve{" "}
        <LegalLink href={LEGAL_LINKS.privacyPolicy}>Gizlilik Politikası</LegalLink>'nı kabul etmiş olursunuz.
      </p>
    </div>
  );
}

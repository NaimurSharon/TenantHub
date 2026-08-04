export interface PolicySection {
  id: string;
  title: string;
  iconName: "Shield" | "Lock" | "FileText" | "Mail" | "UserCheck" | "Share2" | "Eye";
  content?: string;
  effectiveDate?: string;
  lastUpdated?: string;
  noticeBox?: string;
  cards?: Array<{
    title: string;
    iconName?: "Shield" | "Lock";
    items?: Array<{ label: string; description: string }>;
    description?: string;
    highlightNote?: string;
  }>;
  contactDetails?: {
    company: string;
    email: string;
    address: string;
  };
}

export const PRIVACY_POLICY_DATA: PolicySection[] = [
  {
    id: "overview",
    title: "Overview",
    iconName: "FileText",
    effectiveDate: "July 1, 2026",
    lastUpdated: "July 11, 2026",
    content:
      'Welcome to SiSCOTEK. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and desktop platform (collectively, the "App").',
    noticeBox:
      "Please read this Privacy Policy carefully. By accessing or using the App, you agree to the collection and use of information in accordance with this policy.",
  },
  {
    id: "collect",
    title: "Information We Collect",
    iconName: "Shield",
    content:
      "We collect several types of information to provide a seamless property management experience for landlords, property managers, and tenants.",
    cards: [
      {
        title: "Personal Information You Provide",
        iconName: "Shield",
        items: [
          {
            label: "Account Information",
            description: "Name, email address, phone number, password, and profile picture.",
          },
          {
            label: "Property & Lease Details",
            description:
              "Property addresses, lease agreements, rental amounts, move-in/move-out dates, and utility details.",
          },
          {
            label: "Financial Information",
            description:
              "Bank account numbers, routing numbers, or credit card details processed through our secure third-party payment gateways.",
          },
          {
            label: "Identity Verification & Screening",
            description:
              "National Identity Card (NID), Trade license numbers, employment history, and income verification.",
          },
        ],
      },
      {
        title: "Information Collected Automatically",
        iconName: "Lock",
        items: [
          {
            label: "Device Data",
            description:
              "IP address, device type, operating system, unique device identifiers, and mobile network information.",
          },
          {
            label: "Usage Data",
            description:
              "Log files, time and date of access, features used, pages viewed, and app crash reports.",
          },
        ],
      },
    ],
  },
  {
    id: "use",
    title: "How We Use Data",
    iconName: "Lock",
    content: "We use the information we collect for the following business purposes:",
    cards: [
      {
        title: "To Provide the Service",
        description:
          "Managing accounts, facilitating lease signings, processing rent payments, and tracking maintenance requests.",
      },
      {
        title: "To Facilitate Communication",
        description:
          "Allowing landlords, property managers, tenants, and service contractors to message each other regarding property matters.",
      },
      {
        title: "To Screen Tenants",
        description:
          "Processing background checks, credit checks, and eviction history reports at the user's request.",
      },
      {
        title: "To Improve the App",
        description: "Monitoring usage trends, fixing bugs, and developing new features.",
      },
      {
        title: "Security & Compliance",
        description:
          "Preventing fraud, verifying identities, enforcing our Terms of Service, and complying with legal obligations.",
      },
    ],
  },
  {
    id: "sharing",
    title: "Data Sharing",
    iconName: "Share2",
    content:
      "We do not sell your personal data. We only share your information in specific circumstances:",
    cards: [
      {
        title: "Between Users",
        description:
          "We share relevant information between landlords and tenants (e.g., sharing a tenant's maintenance request with the landlord).",
      },
      {
        title: "Legal Requirements",
        description:
          "We may disclose your information if required by law, subpoena, or government regulation.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & Retention",
    iconName: "Lock",
    cards: [
      {
        title: "Security Measures",
        iconName: "Lock",
        description:
          "We implement industry-standard security measures. Financial transactions are encrypted using TLS technology.",
        highlightNote:
          "Important Note: While we take exceptional care to secure your data, no method of transmission over the internet is 100% secure.",
      },
      {
        title: "Data Retention",
        description:
          "We retain your personal information as long as your account is active or needed to fulfill legal obligations.",
      },
    ],
  },
  {
    id: "rights",
    title: "Your Rights",
    iconName: "UserCheck",
    content: "Your Privacy Rights and Choices",
    cards: [
      {
        title: "Access & Portability",
        description: "The right to request copies of the personal data we hold about you.",
      },
      {
        title: "Correction",
        description: "The right to request that we fix inaccurate or incomplete information.",
      },
      {
        title: "Deletion",
        description: "The right to request that we delete your personal data.",
      },
      {
        title: "Opt-Out",
        description: "You can opt out of promotional communications at any time.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    iconName: "Eye",
    content:
      "Our App is not intended for use by individuals under 18. We do not knowingly collect personal data from minors.",
  },
  {
    id: "changes",
    title: "Changes to Policy",
    iconName: "FileText",
    content:
      "We may update our Privacy Policy from time to time. Notifications regarding major changes will be posted on this page.",
  },
  {
    id: "contact",
    title: "Contact Us",
    iconName: "Mail",
    content: "If you have questions or concerns regarding this policy, please contact us:",
    contactDetails: {
      company: "SiSCOTEK",
      email: "siscotek.ny@gmail.com",
      address: "98-10 Ascan Avenue, Forest Hills, NY 11375",
    },
  },
];

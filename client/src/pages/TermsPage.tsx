import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Shield, Users, DollarSign, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using AgentMarket, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms apply to all visitors, users, and others who access or use the service."
      ]
    },
    {
      id: "services",
      title: "Description of Services",
      icon: Users,
      content: [
        "AgentMarket is a marketplace platform that connects AI agent developers with businesses and individuals seeking AI solutions.",
        "We provide tools for listing, discovering, purchasing, and deploying AI agents.",
        "Our platform includes payment processing, user management, and communication tools.",
        "We reserve the right to modify or discontinue services with reasonable notice."
      ]
    },
    {
      id: "accounts",
      title: "User Accounts",
      icon: Shield,
      content: [
        "You must be at least 18 years old to create an account.",
        "You are responsible for safeguarding your account credentials.",
        "You must provide accurate and complete information when creating your account.",
        "You are responsible for all activities that occur under your account.",
        "We reserve the right to terminate accounts that violate our terms."
      ]
    },
    {
      id: "sellers",
      title: "Seller Responsibilities",
      icon: Users,
      content: [
        "Sellers must provide accurate descriptions of their AI agents.",
        "All listed agents must be functional and match their descriptions.",
        "Sellers are responsible for providing customer support for their agents.",
        "Intellectual property rights must be clearly specified.",
        "Sellers must comply with all applicable laws and regulations."
      ]
    },
    {
      id: "buyers",
      title: "Buyer Responsibilities",
      icon: DollarSign,
      content: [
        "Buyers must use purchased agents in accordance with their license terms.",
        "Payment obligations must be fulfilled as agreed.",
        "Buyers should review agent specifications before purchase.",
        "Refund requests must be made within the specified timeframe.",
        "Buyers must respect intellectual property rights."
      ]
    },
    {
      id: "payments",
      title: "Payment Terms",
      icon: DollarSign,
      content: [
        "All payments are processed securely through our payment partners.",
        "Platform fees are deducted from seller earnings as specified.",
        "Refunds are subject to our refund policy.",
        "Sellers receive payments according to our payout schedule.",
        "Disputed transactions will be handled according to our dispute resolution process."
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: Shield,
      content: [
        "Sellers retain ownership of their AI agents and related intellectual property.",
        "Buyers receive usage rights as specified in the agent license.",
        "Our platform and its content are protected by intellectual property laws.",
        "Users must respect third-party intellectual property rights.",
        "We will respond to valid DMCA takedown notices."
      ]
    },
    {
      id: "prohibited",
      title: "Prohibited Uses",
      icon: AlertCircle,
      content: [
        "Users may not use the platform for illegal activities.",
        "Harmful, malicious, or unethical AI applications are prohibited.",
        "Users may not attempt to circumvent platform security measures.",
        "Spam, harassment, and abusive behavior are not tolerated.",
        "Reverse engineering of the platform is prohibited."
      ]
    },
    {
      id: "privacy",
      title: "Privacy and Data Protection",
      icon: Shield,
      content: [
        "We collect and process data as described in our Privacy Policy.",
        "User data is protected with industry-standard security measures.",
        "We do not sell personal information to third parties.",
        "Users have rights regarding their personal data.",
        "We comply with applicable data protection regulations."
      ]
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: AlertCircle,
      content: [
        "Our platform is provided 'as is' without warranties.",
        "We are not liable for agent performance or functionality.",
        "Our total liability is limited to the amount paid for services.",
        "We are not responsible for third-party content or services.",
        "Users agree to indemnify us against claims arising from their use."
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: AlertCircle,
      content: [
        "Either party may terminate their account with proper notice.",
        "We may suspend or terminate accounts for terms violations.",
        "Upon termination, certain provisions of these terms survive.",
        "Users remain responsible for obligations incurred before termination.",
        "We will provide reasonable notice before account termination."
      ]
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: FileText,
      content: [
        "We reserve the right to modify these terms at any time.",
        "Users will be notified of significant changes.",
        "Continued use of the platform constitutes acceptance of new terms.",
        "We will maintain a record of previous versions.",
        "Major changes will include a reasonable notice period."
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Please read these terms carefully before using AgentMarket. 
              By using our platform, you agree to these terms and conditions.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Last updated: July 7, 2025
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <section.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                          {section.title}
                        </a>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-8">
              {sections.map((section) => (
                <Card key={section.id} id={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <section.icon className="h-6 w-6 mr-3 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.content.map((paragraph, index) => (
                        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Contact Information */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-6 w-6 mr-3 text-primary" />
                    Questions About These Terms?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> legal@agentmarket.com</p>
                    <p><strong>Address:</strong> 123 AI Street, Tech Valley, CA 94000</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={() => setLocation('/contact')}>
                      Contact Support
                    </Button>
                    <Button variant="outline" onClick={() => setLocation('/privacy')}>
                      Privacy Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Users, 
  Shield, 
  TrendingUp, 
  Star, 
  Globe,
  CheckCircle,
  Heart,
  Zap,
  Award
} from "lucide-react";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Marketplace",
      description: "Discover and deploy cutting-edge AI agents created by expert developers worldwide."
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "All payments are protected with enterprise-grade security and escrow services."
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Connect with verified AI developers and specialists in various domains."
    },
    {
      icon: TrendingUp,
      title: "Scalable Solutions",
      description: "From simple automation to complex AI systems, find solutions that grow with your needs."
    }
  ];

  const stats = [
    { label: "Active Agents", value: "10,000+", icon: Bot },
    { label: "Developers", value: "2,500+", icon: Users },
    { label: "Satisfied Clients", value: "50,000+", icon: Star },
    { label: "Countries", value: "120+", icon: Globe }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      bio: "Former AI researcher at Google with 10+ years in machine learning.",
      avatar: "SC"
    },
    {
      name: "Alex Rodriguez",
      role: "CTO & Co-Founder",
      bio: "Ex-Tesla engineer specializing in autonomous systems and AI infrastructure.",
      avatar: "AR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of AI Ethics",
      bio: "PhD in AI Ethics from MIT, ensuring responsible AI development practices.",
      avatar: "EW"
    },
    {
      name: "Michael Kim",
      role: "Head of Product",
      bio: "Former product manager at Microsoft, expert in developer tools and platforms.",
      avatar: "MK"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                About AgentMarket
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                We're building the world's largest marketplace for AI agents, connecting businesses 
                with expert developers to accelerate AI adoption and innovation.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => setLocation('/marketplace')}>
                  Explore Marketplace
                </Button>
                <Button variant="outline" size="lg" onClick={() => setLocation('/contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
                To democratize AI by creating a trusted platform where businesses can easily discover, 
                deploy, and scale AI solutions, while empowering developers to monetize their expertise 
                and innovations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                We're a diverse team of AI researchers, engineers, and product experts passionate 
                about making AI accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {member.avatar}
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <Badge variant="secondary">{member.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Values
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Trust & Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    We prioritize the security and privacy of our users' data and transactions, 
                    maintaining the highest standards of protection.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Community First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our community of developers and businesses is at the heart of everything we do, 
                    fostering collaboration and mutual success.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-purple-100 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    We constantly push the boundaries of what's possible with AI, enabling 
                    breakthrough solutions and transformative experiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Join Our Community?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Whether you're looking to deploy AI solutions or share your expertise, 
              AgentMarket is the place to be.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => setLocation('/marketplace')}>
                <Bot className="h-5 w-5 mr-2" />
                Browse Agents
              </Button>
              <Button variant="outline" size="lg" onClick={() => setLocation('/dashboard')}>
                <Award className="h-5 w-5 mr-2" />
                Become a Seller
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
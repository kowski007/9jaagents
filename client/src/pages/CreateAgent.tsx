import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, 
  Plus, 
  X, 
  DollarSign, 
  Calendar, 
  Package, 
  Star,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { apiRequest, isUnauthorizedError } from "@/lib/authUtils";

export default function ListAgent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    basicPrice: "",
    standardPrice: "",
    premiumPrice: "",
    basicDescription: "",
    standardDescription: "",
    premiumDescription: "",
    basicDeliveryDays: "",
    standardDeliveryDays: "",
    premiumDeliveryDays: "",
    freeDescription: "",
    freeDeliveryDays: "",
    tags: [] as string[],
    features: [] as string[],
    useCases: [] as Array<{ title: string; description: string }>,
    supportedFormats: [] as string[],
    integrations: [] as string[],
    apiEndpoints: false,
    responseTime: "",
    accuracy: "",
    modelType: "",
    trainingData: "",
    languages: [] as string[],
    industries: [] as string[],
    imageUrl: "",
    demoUrl: "",
    sourceCodeUrl: "",
    documentationUrl: "",
    videoUrl: "",
    isActive: true,
  });

  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isAuthenticated,
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      const response = await apiRequest('POST', '/api/agents', agentData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your agent has been listed successfully and will appear in the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      setLocation('/seller-dashboard');
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to list your agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId || !formData.basicPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const agentData = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      basicDeliveryDays: parseInt(formData.basicDeliveryDays),
      standardDeliveryDays: formData.standardDeliveryDays ? parseInt(formData.standardDeliveryDays) : null,
      premiumDeliveryDays: formData.premiumDeliveryDays ? parseInt(formData.premiumDeliveryDays) : null,
      freeDeliveryDays: formData.freeDeliveryDays ? parseInt(formData.freeDeliveryDays) : null,
    };

    createAgentMutation.mutate(agentData);
    setIsSubmitting(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter(feature => feature !== featureToRemove) }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Bot className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">List Your AI Agent</h1>
            <p className="text-gray-600 mt-2">Create a listing for your AI agent. Once listed, it will automatically appear in the marketplace for buyers to discover and purchase.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Agent Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Professional Content Writer AI"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your AI agent does and what makes it unique..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input
                  id="demoUrl"
                  value={formData.demoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                  placeholder="https://your-demo-link.com"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Use Cases Section */}
              <div>
                <Label>Use Cases</Label>
                <p className="text-sm text-gray-500 mb-2">Describe specific scenarios where your agent excels</p>
                <div className="space-y-3">
                  {formData.useCases?.map((useCase, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Input
                          placeholder="Use case title (e.g., Content Creation, Customer Support)"
                          value={useCase.title}
                          onChange={(e) => {
                            const updated = [...(formData.useCases || [])];
                            updated[index] = { ...useCase, title: e.target.value };
                            setFormData(prev => ({ ...prev, useCases: updated }));
                          }}
                          className="mr-2"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = (formData.useCases || []).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, useCases: updated }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Describe how your agent solves this specific problem..."
                        value={useCase.description}
                        onChange={(e) => {
                          const updated = [...(formData.useCases || [])];
                          updated[index] = { ...useCase, description: e.target.value };
                          setFormData(prev => ({ ...prev, useCases: updated }));
                        }}
                        rows={2}
                      />
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const updated = [...(formData.useCases || []), { title: '', description: '' }];
                      setFormData(prev => ({ ...prev, useCases: updated }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Use Case
                  </Button>
                </div>
              </div>

              {/* Agent Specifications */}
              <div>
                <Label>Agent Specifications</Label>
                <p className="text-sm text-gray-500 mb-4">Technical details about your agent's capabilities</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responseTime">Response Time</Label>
                    <Select 
                      value={formData.responseTime || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, responseTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant (< 1 second)</SelectItem>
                        <SelectItem value="fast">Fast (1-5 seconds)</SelectItem>
                        <SelectItem value="moderate">Moderate (5-15 seconds)</SelectItem>
                        <SelectItem value="slow">Slow (15+ seconds)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accuracy">Accuracy Level</Label>
                    <Select 
                      value={formData.accuracy || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, accuracy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select accuracy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (95%+)</SelectItem>
                        <SelectItem value="medium">Medium (85-95%)</SelectItem>
                        <SelectItem value="basic">Basic (75-85%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* AI Model Information */}
              <div>
                <Label>AI Model Information</Label>
                <p className="text-sm text-gray-500 mb-4">Details about the underlying AI technology</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="modelType">Model Type</Label>
                    <Select 
                      value={formData.modelType || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, modelType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                        <SelectItem value="custom">Custom Model</SelectItem>
                        <SelectItem value="fine-tuned">Fine-tuned Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trainingData">Training Data</Label>
                    <Input
                      id="trainingData"
                      value={formData.trainingData || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, trainingData: e.target.value }))}
                      placeholder="e.g., Industry-specific, General knowledge"
                    />
                  </div>
                </div>
              </div>

              {/* Languages and Localization */}
              <div>
                <Label>Languages Supported</Label>
                <Input
                  placeholder="e.g., English, Spanish, French, German (comma separated)"
                  onChange={(e) => {
                    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, languages: languages }));
                  }}
                />
              </div>

              {/* Industries and Target Audience */}
              <div>
                <Label>Target Industries</Label>
                <Input
                  placeholder="e.g., Healthcare, Finance, Education, E-commerce (comma separated)"
                  onChange={(e) => {
                    const industries = e.target.value.split(',').map(ind => ind.trim()).filter(Boolean);
                    setFormData(prev => ({ ...prev, industries: industries }));
                  }}
                />
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="supportedFormats">Supported Formats</Label>
                  <Input
                    id="supportedFormats"
                    placeholder="JSON, CSV, XML (comma separated)"
                    onChange={(e) => {
                      const formats = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, supportedFormats: formats }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="integrations">Integrations</Label>
                  <Input
                    id="integrations"
                    placeholder="Slack, Discord, API (comma separated)"
                    onChange={(e) => {
                      const integrations = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, integrations: integrations }));
                    }}
                  />
                </div>
                <div>
                  <Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.apiEndpoints || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiEndpoints: e.target.checked }))}
                      />
                      <span>Includes API Access</span>
                    </div>
                  </Label>
                </div>
              </div>

              <div>
                <Label>Features</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="flex items-center gap-1">
                      {feature}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFeature(feature)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Agent Media & Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Agent Media & Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="imageUrl">Agent Image/Avatar URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/agent-avatar.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Display image for your AI agent</p>
                </div>

                <div>
                  <Label htmlFor="demoUrl">Live Demo URL</Label>
                  <Input
                    id="demoUrl"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://demo.example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">Live preview/demo of your agent</p>
                </div>

                <div>
                  <Label htmlFor="sourceCodeUrl">Source Code URL</Label>
                  <Input
                    id="sourceCodeUrl"
                    value={formData.sourceCodeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceCodeUrl: e.target.value }))}
                    placeholder="https://github.com/username/repo"
                  />
                  <p className="text-sm text-gray-500 mt-1">GitHub or code repository link</p>
                </div>

                <div>
                  <Label htmlFor="documentationUrl">Documentation URL</Label>
                  <Input
                    id="documentationUrl"
                    value={formData.documentationUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                    placeholder="https://docs.example.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">API docs or user guide</p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="videoUrl">Demo Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500 mt-1">YouTube or demo video showcasing your agent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Free Package */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Package className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold">Free Package</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="freePrice">Price ($)</Label>
                      <Input
                        id="freePrice"
                        type="number"
                        value="0.00"
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeDeliveryDays">Delivery Days</Label>
                      <Input
                        id="freeDeliveryDays"
                        type="number"
                        value={formData.freeDeliveryDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, freeDeliveryDays: e.target.value }))}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeDescription">Description</Label>
                      <Textarea
                        id="freeDescription"
                        value={formData.freeDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, freeDescription: e.target.value }))}
                        placeholder="What's included in the free package..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Package */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Package className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-semibold">Basic Package *</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="basicPrice">Price ($) *</Label>
                      <Input
                        id="basicPrice"
                        type="number"
                        step="0.01"
                        value={formData.basicPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, basicPrice: e.target.value }))}
                        placeholder="25.00"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicDeliveryDays">Delivery Days *</Label>
                      <Input
                        id="basicDeliveryDays"
                        type="number"
                        value={formData.basicDeliveryDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, basicDeliveryDays: e.target.value }))}
                        placeholder="3"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="basicDescription">Description *</Label>
                      <Textarea
                        id="basicDescription"
                        value={formData.basicDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, basicDescription: e.target.value }))}
                        placeholder="What's included in the basic package..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Standard Package */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Star className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold">Standard Package</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="standardPrice">Price ($)</Label>
                      <Input
                        id="standardPrice"
                        type="number"
                        step="0.01"
                        value={formData.standardPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, standardPrice: e.target.value }))}
                        placeholder="50.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="standardDeliveryDays">Delivery Days</Label>
                      <Input
                        id="standardDeliveryDays"
                        type="number"
                        value={formData.standardDeliveryDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, standardDeliveryDays: e.target.value }))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="standardDescription">Description</Label>
                      <Textarea
                        id="standardDescription"
                        value={formData.standardDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, standardDescription: e.target.value }))}
                        placeholder="What's included in the standard package..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Premium Package */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Star className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold">Premium Package</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="premiumPrice">Price ($)</Label>
                      <Input
                        id="premiumPrice"
                        type="number"
                        step="0.01"
                        value={formData.premiumPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, premiumPrice: e.target.value }))}
                        placeholder="100.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="premiumDeliveryDays">Delivery Days</Label>
                      <Input
                        id="premiumDeliveryDays"
                        type="number"
                        value={formData.premiumDeliveryDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, premiumDeliveryDays: e.target.value }))}
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <Label htmlFor="premiumDescription">Description</Label>
                      <Textarea
                        id="premiumDescription"
                        value={formData.premiumDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, premiumDescription: e.target.value }))}
                        placeholder="What's included in the premium package..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active Listing</Label>
                  <p className="text-sm text-gray-500">Make your agent visible in the marketplace</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              Once listed, your agent will appear in the marketplace for buyers to discover.
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation('/seller-dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Listing..." : "List Agent"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </Layout>
  );
}
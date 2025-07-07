
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Save, X, DollarSign, Clock, Tag, FileText, Link as LinkIcon } from "lucide-react";

interface AdminAgentFormData {
  title: string;
  description: string;
  categoryId: string;
  basicPrice: string;
  standardPrice: string;
  premiumPrice: string;
  basicDescription: string;
  standardDescription: string;
  premiumDescription: string;
  basicDeliveryDays: string;
  standardDeliveryDays: string;
  premiumDeliveryDays: string;
  tags: string[];
  features: string[];
  imageUrl: string;
  demoUrl: string;
  documentationUrl: string;
  isActive: boolean;
  sellerId: string;
}

export default function AdminAgentCreation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  const [formData, setFormData] = useState<AdminAgentFormData>({
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
    tags: [],
    features: [],
    imageUrl: "",
    demoUrl: "",
    documentationUrl: "",
    isActive: true,
    sellerId: ""
  });

  // Fetch categories and users for the form
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error('Failed to create agent');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Agent created successfully and added to the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
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
      tags: [],
      features: [],
      imageUrl: "",
      demoUrl: "",
      documentationUrl: "",
      isActive: true,
      sellerId: ""
    });
    setTagInput("");
    setFeatureInput("");
  };

  const handleInputChange = (field: keyof AdminAgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.categoryId || !formData.sellerId) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.basicPrice || !formData.standardPrice || !formData.premiumPrice) {
        toast({
          title: "Validation Error",
          description: "Please set all pricing tiers.",
          variant: "destructive",
        });
        return;
      }

      const agentData = {
        ...formData,
        basicPrice: parseFloat(formData.basicPrice),
        standardPrice: parseFloat(formData.standardPrice),
        premiumPrice: parseFloat(formData.premiumPrice),
        basicDeliveryDays: parseInt(formData.basicDeliveryDays) || 1,
        standardDeliveryDays: parseInt(formData.standardDeliveryDays) || 3,
        premiumDeliveryDays: parseInt(formData.premiumDeliveryDays) || 7,
        categoryId: parseInt(formData.categoryId),
      };

      await createAgentMutation.mutateAsync(agentData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellers = users.filter(user => user.role === 'seller' || user.role === 'admin');

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-purple-100 bg-gradient-purple-light">
        <CardTitle className="text-xl text-gray-900 flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          Create New Agent
        </CardTitle>
        <CardDescription className="text-gray-600">
          Add a new AI agent directly to the marketplace
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Agent Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter agent title"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
                  Category *
                </Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
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

              <div>
                <Label htmlFor="sellerId" className="text-sm font-medium text-gray-700">
                  Assign to Seller *
                </Label>
                <Select value={formData.sellerId} onValueChange={(value) => handleInputChange('sellerId', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select seller" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map((seller: any) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.firstName} {seller.lastName} ({seller.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this agent does"
                  className="mt-2 h-32"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Active Status
                  </Label>
                  <p className="text-xs text-gray-500">
                    Make agent immediately available
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Tier */}
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-700">Basic Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.basicPrice}
                      onChange={(e) => handleInputChange('basicPrice', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Description</Label>
                    <Textarea
                      value={formData.basicDescription}
                      onChange={(e) => handleInputChange('basicDescription', e.target.value)}
                      placeholder="Basic package features"
                      className="h-20 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Delivery (days)</Label>
                    <Input
                      type="number"
                      value={formData.basicDeliveryDays}
                      onChange={(e) => handleInputChange('basicDeliveryDays', e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Standard Tier */}
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-700">Standard Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.standardPrice}
                      onChange={(e) => handleInputChange('standardPrice', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Description</Label>
                    <Textarea
                      value={formData.standardDescription}
                      onChange={(e) => handleInputChange('standardDescription', e.target.value)}
                      placeholder="Standard package features"
                      className="h-20 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Delivery (days)</Label>
                    <Input
                      type="number"
                      value={formData.standardDeliveryDays}
                      onChange={(e) => handleInputChange('standardDeliveryDays', e.target.value)}
                      placeholder="3"
                      min="1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Premium Tier */}
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-purple-700">Premium Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.premiumPrice}
                      onChange={(e) => handleInputChange('premiumPrice', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Description</Label>
                    <Textarea
                      value={formData.premiumDescription}
                      onChange={(e) => handleInputChange('premiumDescription', e.target.value)}
                      placeholder="Premium package features"
                      className="h-20 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Delivery (days)</Label>
                    <Input
                      type="number"
                      value={formData.premiumDeliveryDays}
                      onChange={(e) => handleInputChange('premiumDeliveryDays', e.target.value)}
                      placeholder="7"
                      min="1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tags and Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-purple-200">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                  <FileText className="h-4 w-4 mr-2" />
                  Features
                </Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="border-purple-200">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Media Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Media & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="demoUrl" className="text-sm font-medium text-gray-700">
                  Demo URL
                </Label>
                <Input
                  id="demoUrl"
                  value={formData.demoUrl}
                  onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                  placeholder="https://demo.example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="documentationUrl" className="text-sm font-medium text-gray-700">
                  Documentation URL
                </Label>
                <Input
                  id="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={(e) => handleInputChange('documentationUrl', e.target.value)}
                  placeholder="https://docs.example.com"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-purple hover:opacity-90 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Upload, X, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/useAuth';
import { useItems } from '@/hooks/useItems';

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'lost' | 'found';
  refreshItems?: () => void;
}

const ReportItemModal = ({ isOpen, onClose, type, refreshItems }: ReportItemModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    type: '',
    status: '',
    location: '',
    dateOccurred: new Date(),
    contactInfo: '',
    tags: '',
    images: [] as string[]
  });
  const { token, user } = useAuth();
  const { addItem } = useItems();

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'documents', label: 'Documents' },
    { value: 'keys', label: 'Keys' },
    { value: 'bags', label: 'Bags' },
    { value: 'other', label: 'Other' }
  ];

  // ...existing code...

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    // Prepare tags and images
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
    // Prepare item data for backend
    const itemData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: type, // 'lost' or 'found'
      status: 'pending', // Always start as pending
      location: formData.location,
      dateReported: new Date().toISOString(),
      dateOccurred: formData.dateOccurred instanceof Date ? formData.dateOccurred.toISOString() : formData.dateOccurred,
      images: formData.images,
      tags: tagsArray,
      contactInfo: formData.contactInfo,
    };
    try {
      await addItem(itemData, token);
      setIsLoading(false);
      if (refreshItems) refreshItems();
      onClose();
      // Optionally show success notification here
    } catch (error: any) {
      setIsLoading(false);
      // Optionally show error notification here
      console.error(error.message);
    }
  };

  // Upload images to backend and store filenames
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const formDataUpload = new FormData();
      Array.from(files).forEach(file => formDataUpload.append('images', file));
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/images`, {
          method: 'POST',
          body: formDataUpload
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        // data.filenames is an array of uploaded filenames
        setFormData(prev => ({ ...prev, images: [...prev.images, ...data.filenames] }));
      } catch (err) {
        alert('Image upload failed. Please try again.');
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Report {type === 'lost' ? 'Lost' : 'Found'} Item
          </DialogTitle>
          <DialogDescription className="text-center">
            Provide details about the {type} item to help us match it with others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Item Name *</Label>
              <Input
                id="title"
                placeholder="e.g., iPhone 14 Pro, Brown Leather Wallet"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description including color, size, brand, distinctive features..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Where was the item lost/found?"
                  className="pl-10"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date {type === 'lost' ? 'Lost' : 'Found'} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOccurred && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOccurred ? format(formData.dateOccurred, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOccurred}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dateOccurred: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              placeholder="Email or phone number for contact (optional)"
              value={formData.contactInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Add tags separated by commas (e.g., blue, leather, small)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Photos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 10MB
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1",
                type === 'lost' 
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" 
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportItemModal;

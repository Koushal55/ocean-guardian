'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, MapPin, Camera, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Coordinates {
  lat?: number;
  lon?: number;
}

export default function ReportHazardPage() {
  const [formData, setFormData] = useState({
    hazardType: "",
    description: "",
    location: "",
    urgency: "",
    vesselInfo: "",
  });
  const [coordinates, setCoordinates] = useState<Coordinates>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 4;
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const hazardTypes = [
    { value: "algal-bloom", label: "Harmful Algal Bloom", description: "Discolored water (red/brown tide) that may be harmful." },
    { value: "marine-debris", label: "Marine Debris Field", description: "Large collections of floating trash or 'ghost nets'." },
    { value: "whale-entanglement", label: "Whale Entanglement", description: "A marine mammal caught in nets or fishing gear." },
    { value: "coastal-hazard", label: "Coastal Hazard", description: "Reports of dangerous rip currents, high surf, or coastal erosion." },
    { value: "oil-spill", label: "Oil Spill", description: "Petroleum products in water" },
    { value: "plastic-pollution", label: "Plastic Pollution", description: "Large debris fields or plastic waste" },
    { value: "chemical-discharge", label: "Chemical Discharge", description: "Suspicious chemical releases" },
    { value: "marine-life-distress", label: "Marine Life Distress", description: "Injured or endangered wildlife" }
  ];

  const urgencyLevels = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => {
        const combined = [...prevFiles, ...newFiles];
        if (combined.length > 3) {
          alert("You can upload a maximum of 3 photos.");
          return combined.slice(0, 3);
        }
        return combined;
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          setFormData(prev => ({ ...prev, location: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
          alert(`Location captured!`);
        },
        (error) => alert(`Error getting location: ${error.message}`)
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCoordinates(prev => ({
      ...prev,
      [name]: value === "" ? undefined : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Your session has expired. Please log in again.");
      router.push('/login');
      return;
    }

    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const formDataCloud = new FormData();
          formDataCloud.append('file', file);
          formDataCloud.append('upload_preset', 'OCEANS');
          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formDataCloud,
          });
          const data = await res.json();
          return data.secure_url;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const reportData = { ...formData, coordinates, imageUrls };
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit report.');
      }

      alert("Thank you! Your report has been submitted successfully.");
      router.push('/dashboard');

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    if (currentStep === 1 && !formData.hazardType) return false;
    if (currentStep === 2 && (!formData.description || !formData.urgency)) return false;
    if (
      currentStep === 3 &&
      (typeof coordinates.lat !== "number" ||
        isNaN(coordinates.lat) ||
        typeof coordinates.lon !== "number" ||
        isNaN(coordinates.lon))
    )
      return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Ocean Hazard</h1>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Hazard Type"}
              {currentStep === 2 && "Hazard Details"}
              {currentStep === 3 && "Location"}
              {currentStep === 4 && "Evidence (Optional)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Hazard Type */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hazardTypes.map((type) => (
                    <Card key={type.value} onClick={() => setFormData(prev => ({ ...prev, hazardType: type.value }))}
                      className={`cursor-pointer transition-all ${formData.hazardType === type.value ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{type.label}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <Textarea placeholder="Describe what you observed in detail..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} required className="min-h-[120px]" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {urgencyLevels.map(level => (
                      <Card key={level.value} onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                        className={`cursor-pointer text-center transition-all ${formData.urgency === level.value ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                        <CardContent className="p-3"><Badge className={`${level.color} hover:bg-none`}>{level.label}</Badge></CardContent>
                      </Card>
                    ))}
                  </div>
                  <Input placeholder="Vessel Information (Optional)" value={formData.vesselInfo} onChange={(e) => setFormData(prev => ({ ...prev, vesselInfo: e.target.value }))} />
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="location-desc">Location Description (Optional)</Label>
                    <Textarea
                      id="location-desc"
                      placeholder="e.g., 5 miles off the coast..."
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude (Required)</Label>
                      <Input
                        id="lat"
                        name="lat"
                        type="number"
                        placeholder="e.g., 17.7052"
                        value={coordinates.lat ?? ''}
                        onChange={handleCoordinateChange}
                        required
                        step="any"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lon">Longitude (Required)</Label>
                      <Input
                        id="lon"
                        name="lon"
                        type="number"
                        placeholder="e.g., 83.3215"
                        value={coordinates.lon ?? ''}
                        onChange={handleCoordinateChange}
                        required
                        step="any"
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Current GPS Location
                  </Button>
                </div>
              )}

              {/* Step 4: Evidence */}
              {currentStep === 4 && (
                <div>
                  <Label htmlFor="photo-upload">Upload Photos</Label>
                  <div className="mt-2 p-8 border-dashed border-2 rounded-lg text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Input id="photo-upload" type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full" disabled={files.length >= 3} />
                    {files.length >= 3 && <p className="text-sm text-red-500 mt-2">Maximum of 3 photos reached.</p>}
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative">
                          <Image src={URL.createObjectURL(file)} alt={`preview ${index}`} width={100} height={100} className="w-full h-24 object-cover rounded-md" />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                  Previous
                </Button>

                {currentStep < totalSteps && (
                  <Button type="button" onClick={nextStep} disabled={!isStepValid()}>
                    Next Step
                  </Button>
                )}

                {currentStep === totalSteps && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : (<><Send className="h-4 w-4 mr-2" />Submit Report</>)}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
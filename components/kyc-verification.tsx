"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Shield, Upload, CheckCircle, AlertCircle, Camera, FileText, User, MapPin } from "lucide-react"

interface KYCVerificationProps {
  provider: string
  onComplete: (verified: boolean) => void
  onClose: () => void
}

interface KYCData {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  address: string
  city: string
  postalCode: string
  country: string
  phoneNumber: string
  idType: string
  idNumber: string
  idFrontImage: File | null
  idBackImage: File | null
  selfieImage: File | null
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
]

const ID_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID Card" },
]

export default function KYCVerification({ provider, onComplete, onClose }: KYCVerificationProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [kycData, setKycData] = useState<KYCData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
    idType: "",
    idNumber: "",
    idFrontImage: null,
    idBackImage: null,
    selfieImage: null,
  })

  const { toast } = useToast()

  const progress = (step / 4) * 100

  const handleInputChange = (field: keyof KYCData, value: string) => {
    setKycData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: keyof KYCData, file: File | null) => {
    setKycData((prev) => ({ ...prev, [field]: file }))
  }

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(kycData.firstName && kycData.lastName && kycData.dateOfBirth && kycData.nationality)
      case 2:
        return !!(kycData.address && kycData.city && kycData.country && kycData.phoneNumber)
      case 3:
        return !!(
          kycData.idType &&
          kycData.idNumber &&
          kycData.idFrontImage &&
          (kycData.idType !== "passport" ? kycData.idBackImage : true)
        )
      case 4:
        return !!kycData.selfieImage
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1)
      } else {
        handleSubmit()
      }
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Simulate KYC submission
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "KYC Submitted",
        description: "Your verification is being processed. You'll be notified once approved.",
      })

      onComplete(true)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const FileUploadButton = ({
    label,
    file,
    onUpload,
    accept = "image/*",
  }: {
    label: string
    file: File | null
    onUpload: (file: File | null) => void
    accept?: string
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{file.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onUpload(null)}>
              Remove
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</div>
            <input
              type="file"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
              }}
              className="hidden"
              id={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`upload-${label.replace(/\s+/g, "-").toLowerCase()}`)?.click()}
            >
              Choose File
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            ←
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Identity Verification</h1>
            <p className="text-muted-foreground">Complete KYC verification for {provider}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Provide your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={kycData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={kycData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Select value={kycData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your personal information is encrypted and stored securely. It will only be used for verification
                  purposes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </CardTitle>
              <CardDescription>Provide your current residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={kycData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={kycData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={kycData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={kycData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={kycData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Identity Document
              </CardTitle>
              <CardDescription>Upload a government-issued ID document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idType">Document Type *</Label>
                <Select value={kycData.idType} onValueChange={(value) => handleInputChange("idType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">Document Number *</Label>
                <Input
                  id="idNumber"
                  value={kycData.idNumber}
                  onChange={(e) => handleInputChange("idNumber", e.target.value)}
                  placeholder="Enter document number"
                />
              </div>

              <FileUploadButton
                label="Front of Document *"
                file={kycData.idFrontImage}
                onUpload={(file) => handleFileUpload("idFrontImage", file)}
              />

              {kycData.idType && kycData.idType !== "passport" && (
                <FileUploadButton
                  label="Back of Document *"
                  file={kycData.idBackImage}
                  onUpload={(file) => handleFileUpload("idBackImage", file)}
                />
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ensure your document is clear, well-lit, and all corners are visible. Accepted formats: JPG, PNG, PDF.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Selfie Verification
              </CardTitle>
              <CardDescription>Take a selfie to verify your identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadButton
                label="Selfie Photo *"
                file={kycData.selfieImage}
                onUpload={(file) => handleFileUpload("selfieImage", file)}
              />

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Take a clear selfie showing your face. Make sure you're in good lighting and looking directly at the
                  camera.
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Verification Tips:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Remove sunglasses and hats</li>
                  <li>• Ensure good lighting on your face</li>
                  <li>• Look directly at the camera</li>
                  <li>• Keep a neutral expression</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={!validateStep(step) || isLoading} className="flex-1">
            {isLoading ? "Submitting..." : step === 4 ? "Submit Verification" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

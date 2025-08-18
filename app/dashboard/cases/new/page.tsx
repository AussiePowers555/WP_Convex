"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Save, User, Car, FileText, Users } from "lucide-react";
import Link from "next/link";

const australianStates = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function NewCasePage() {
  const router = useRouter();
  const createCase = useMutation(api.cases.create);
  const lawyers = useQuery(api.contacts.getLawyers);
  const rentalCompanies = useQuery(api.contacts.getRentalCompanies);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // NAF Party
    nafName: "",
    nafPhone: "",
    nafEmail: "",
    nafAddress: "",
    nafSuburb: "",
    nafState: "",
    nafPostcode: "",
    nafDob: "",
    nafLicenceNo: "",
    nafLicenceState: "",
    nafLicenceExp: "",
    nafClaimNumber: "",
    nafInsuranceCompany: "",
    nafInsurer: "",
    nafVehicleRego: "",
    nafVehicleMake: "",
    nafVehicleModel: "",
    nafVehicleYear: "",
    
    // AF Party
    afName: "",
    afPhone: "",
    afEmail: "",
    afAddress: "",
    afSuburb: "",
    afState: "",
    afPostcode: "",
    afClaimNumber: "",
    afInsuranceCompany: "",
    afInsurer: "",
    afVehicleRego: "",
    afVehicleMake: "",
    afVehicleModel: "",
    afVehicleYear: "",
    
    // Accident Details
    accidentDate: "",
    accidentTime: "",
    accidentLocation: "",
    accidentDescription: "",
    
    // Assignments
    assignedLawyerId: "",
    assignedRentalCompanyId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nafName || !formData.afName) {
      toast.error("Please provide names for both NAF and AF parties");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const caseData = {
        ...formData,
        nafVehicleYear: formData.nafVehicleYear ? parseInt(formData.nafVehicleYear) : undefined,
        afVehicleYear: formData.afVehicleYear ? parseInt(formData.afVehicleYear) : undefined,
        assignedLawyerId: formData.assignedLawyerId || undefined,
        assignedRentalCompanyId: formData.assignedRentalCompanyId || undefined,
      };
      
      const caseId = await createCase(caseData as any);
      toast.success("Case created successfully");
      router.push(`/dashboard/cases/${caseId}`);
    } catch (error) {
      toast.error("Failed to create case");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Case</h2>
          <p className="text-muted-foreground">
            Create a new rental case
          </p>
        </div>
        <Link href="/dashboard/cases">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cases
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="naf" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="naf">
              <User className="mr-2 h-4 w-4" />
              NAF Party
            </TabsTrigger>
            <TabsTrigger value="af">
              <User className="mr-2 h-4 w-4" />
              AF Party
            </TabsTrigger>
            <TabsTrigger value="accident">
              <Car className="mr-2 h-4 w-4" />
              Accident
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Users className="mr-2 h-4 w-4" />
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="naf" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Not-At-Fault Party Details</CardTitle>
                <CardDescription>
                  Information about the client (NAF party)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nafName">Full Name *</Label>
                  <Input
                    id="nafName"
                    value={formData.nafName}
                    onChange={(e) => handleInputChange("nafName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafPhone">Phone</Label>
                  <Input
                    id="nafPhone"
                    type="tel"
                    value={formData.nafPhone}
                    onChange={(e) => handleInputChange("nafPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafEmail">Email</Label>
                  <Input
                    id="nafEmail"
                    type="email"
                    value={formData.nafEmail}
                    onChange={(e) => handleInputChange("nafEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafDob">Date of Birth</Label>
                  <Input
                    id="nafDob"
                    type="date"
                    value={formData.nafDob}
                    onChange={(e) => handleInputChange("nafDob", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nafAddress">Street Address</Label>
                  <Input
                    id="nafAddress"
                    value={formData.nafAddress}
                    onChange={(e) => handleInputChange("nafAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafSuburb">Suburb</Label>
                  <Input
                    id="nafSuburb"
                    value={formData.nafSuburb}
                    onChange={(e) => handleInputChange("nafSuburb", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafState">State</Label>
                  <Select value={formData.nafState} onValueChange={(value) => handleInputChange("nafState", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {australianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafPostcode">Postcode</Label>
                  <Input
                    id="nafPostcode"
                    value={formData.nafPostcode}
                    onChange={(e) => handleInputChange("nafPostcode", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafLicenceNo">Licence Number</Label>
                  <Input
                    id="nafLicenceNo"
                    value={formData.nafLicenceNo}
                    onChange={(e) => handleInputChange("nafLicenceNo", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafLicenceState">Licence State</Label>
                  <Select value={formData.nafLicenceState} onValueChange={(value) => handleInputChange("nafLicenceState", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {australianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafLicenceExp">Licence Expiry</Label>
                  <Input
                    id="nafLicenceExp"
                    type="date"
                    value={formData.nafLicenceExp}
                    onChange={(e) => handleInputChange("nafLicenceExp", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NAF Insurance & Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nafClaimNumber">Claim Number</Label>
                  <Input
                    id="nafClaimNumber"
                    value={formData.nafClaimNumber}
                    onChange={(e) => handleInputChange("nafClaimNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafInsuranceCompany">Insurance Company</Label>
                  <Input
                    id="nafInsuranceCompany"
                    value={formData.nafInsuranceCompany}
                    onChange={(e) => handleInputChange("nafInsuranceCompany", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafVehicleRego">Vehicle Registration</Label>
                  <Input
                    id="nafVehicleRego"
                    value={formData.nafVehicleRego}
                    onChange={(e) => handleInputChange("nafVehicleRego", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafVehicleMake">Vehicle Make</Label>
                  <Input
                    id="nafVehicleMake"
                    value={formData.nafVehicleMake}
                    onChange={(e) => handleInputChange("nafVehicleMake", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafVehicleModel">Vehicle Model</Label>
                  <Input
                    id="nafVehicleModel"
                    value={formData.nafVehicleModel}
                    onChange={(e) => handleInputChange("nafVehicleModel", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nafVehicleYear">Vehicle Year</Label>
                  <Input
                    id="nafVehicleYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.nafVehicleYear}
                    onChange={(e) => handleInputChange("nafVehicleYear", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="af" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>At-Fault Party Details</CardTitle>
                <CardDescription>
                  Information about the at-fault party
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="afName">Full Name *</Label>
                  <Input
                    id="afName"
                    value={formData.afName}
                    onChange={(e) => handleInputChange("afName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afPhone">Phone</Label>
                  <Input
                    id="afPhone"
                    type="tel"
                    value={formData.afPhone}
                    onChange={(e) => handleInputChange("afPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afEmail">Email</Label>
                  <Input
                    id="afEmail"
                    type="email"
                    value={formData.afEmail}
                    onChange={(e) => handleInputChange("afEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="afAddress">Street Address</Label>
                  <Input
                    id="afAddress"
                    value={formData.afAddress}
                    onChange={(e) => handleInputChange("afAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afSuburb">Suburb</Label>
                  <Input
                    id="afSuburb"
                    value={formData.afSuburb}
                    onChange={(e) => handleInputChange("afSuburb", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afState">State</Label>
                  <Select value={formData.afState} onValueChange={(value) => handleInputChange("afState", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {australianStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afPostcode">Postcode</Label>
                  <Input
                    id="afPostcode"
                    value={formData.afPostcode}
                    onChange={(e) => handleInputChange("afPostcode", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AF Insurance & Vehicle</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="afClaimNumber">Claim Number</Label>
                  <Input
                    id="afClaimNumber"
                    value={formData.afClaimNumber}
                    onChange={(e) => handleInputChange("afClaimNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afInsuranceCompany">Insurance Company</Label>
                  <Input
                    id="afInsuranceCompany"
                    value={formData.afInsuranceCompany}
                    onChange={(e) => handleInputChange("afInsuranceCompany", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afVehicleRego">Vehicle Registration</Label>
                  <Input
                    id="afVehicleRego"
                    value={formData.afVehicleRego}
                    onChange={(e) => handleInputChange("afVehicleRego", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afVehicleMake">Vehicle Make</Label>
                  <Input
                    id="afVehicleMake"
                    value={formData.afVehicleMake}
                    onChange={(e) => handleInputChange("afVehicleMake", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afVehicleModel">Vehicle Model</Label>
                  <Input
                    id="afVehicleModel"
                    value={formData.afVehicleModel}
                    onChange={(e) => handleInputChange("afVehicleModel", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="afVehicleYear">Vehicle Year</Label>
                  <Input
                    id="afVehicleYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.afVehicleYear}
                    onChange={(e) => handleInputChange("afVehicleYear", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accident" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accident Details</CardTitle>
                <CardDescription>
                  Information about the accident
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accidentDate">Accident Date</Label>
                  <Input
                    id="accidentDate"
                    type="date"
                    value={formData.accidentDate}
                    onChange={(e) => handleInputChange("accidentDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accidentTime">Accident Time</Label>
                  <Input
                    id="accidentTime"
                    type="time"
                    value={formData.accidentTime}
                    onChange={(e) => handleInputChange("accidentTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accidentLocation">Accident Location</Label>
                  <Input
                    id="accidentLocation"
                    value={formData.accidentLocation}
                    onChange={(e) => handleInputChange("accidentLocation", e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="accidentDescription">Accident Description</Label>
                  <Textarea
                    id="accidentDescription"
                    rows={4}
                    value={formData.accidentDescription}
                    onChange={(e) => handleInputChange("accidentDescription", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Assignments</CardTitle>
                <CardDescription>
                  Assign lawyer and rental company to this case
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="assignedLawyerId">Assigned Lawyer</Label>
                  <Select 
                    value={formData.assignedLawyerId} 
                    onValueChange={(value) => handleInputChange("assignedLawyerId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lawyer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {lawyers?.map(lawyer => (
                        <SelectItem key={lawyer._id} value={lawyer._id}>
                          {lawyer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedRentalCompanyId">Assigned Rental Company</Label>
                  <Select 
                    value={formData.assignedRentalCompanyId} 
                    onValueChange={(value) => handleInputChange("assignedRentalCompanyId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rental company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {rentalCompanies?.map(company => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard/cases">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Case
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
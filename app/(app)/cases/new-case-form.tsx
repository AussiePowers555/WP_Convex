"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, User, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"

const formSchema = z.object({
  // NAF (Not At Fault) Client fields
  nafName: z.string().min(1, "Client name is required."),
  nafPhone: z.string().optional(),
  nafEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  nafAddress: z.string().optional(),
  nafSuburb: z.string().optional(),
  nafState: z.string().optional(),
  nafPostcode: z.string().optional(),
  nafClaimNumber: z.string().optional(),
  nafInsuranceCompany: z.string().optional(),
  nafInsurer: z.string().optional(),
  nafVehicleRego: z.string().optional(),
  nafVehicleMake: z.string().optional(),
  nafVehicleModel: z.string().optional(),
  nafVehicleYear: z.coerce.number().optional(),
  
  // AF (At Fault) Party fields
  afName: z.string().min(1, "At-fault party name is required."),
  afPhone: z.string().optional(),
  afEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  afAddress: z.string().optional(),
  afSuburb: z.string().optional(),
  afState: z.string().optional(),
  afPostcode: z.string().optional(),
  afClaimNumber: z.string().optional(),
  afInsuranceCompany: z.string().optional(),
  afInsurer: z.string().optional(),
  afVehicleRego: z.string().optional(),
  afVehicleMake: z.string().optional(),
  afVehicleModel: z.string().optional(),
  afVehicleYear: z.coerce.number().optional(),
  
  // Accident details
  accidentDate: z.string().optional(),
  accidentTime: z.string().optional(),
  accidentLocation: z.string().optional(),
  accidentDescription: z.string().optional(),
})

const australianStates = [
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "WA", label: "WA" },
  { value: "SA", label: "SA" },
  { value: "TAS", label: "TAS" },
  { value: "ACT", label: "ACT" },
  { value: "NT", label: "NT" },
]

interface NewCaseFormProps {
  onClose: () => void
}

export default function NewCaseForm({ onClose }: NewCaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createCase = useMutation(api.cases.create)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nafName: "",
      nafPhone: "",
      nafEmail: "",
      nafAddress: "",
      nafSuburb: "",
      nafState: "",
      nafPostcode: "",
      nafClaimNumber: "",
      nafInsuranceCompany: "",
      nafInsurer: "",
      nafVehicleRego: "",
      nafVehicleMake: "",
      nafVehicleModel: "",
      nafVehicleYear: undefined,
      
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
      afVehicleYear: undefined,
      
      accidentDate: "",
      accidentTime: "",
      accidentLocation: "",
      accidentDescription: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      await createCase({
        nafName: values.nafName,
        nafPhone: values.nafPhone || undefined,
        nafEmail: values.nafEmail || undefined,
        nafAddress: values.nafAddress || undefined,
        nafSuburb: values.nafSuburb || undefined,
        nafState: values.nafState || undefined,
        nafPostcode: values.nafPostcode || undefined,
        nafClaimNumber: values.nafClaimNumber || undefined,
        nafInsuranceCompany: values.nafInsuranceCompany || undefined,
        nafInsurer: values.nafInsurer || undefined,
        nafVehicleRego: values.nafVehicleRego || undefined,
        nafVehicleMake: values.nafVehicleMake || undefined,
        nafVehicleModel: values.nafVehicleModel || undefined,
        nafVehicleYear: values.nafVehicleYear || undefined,
        
        afName: values.afName,
        afPhone: values.afPhone || undefined,
        afEmail: values.afEmail || undefined,
        afAddress: values.afAddress || undefined,
        afSuburb: values.afSuburb || undefined,
        afState: values.afState || undefined,
        afPostcode: values.afPostcode || undefined,
        afClaimNumber: values.afClaimNumber || undefined,
        afInsuranceCompany: values.afInsuranceCompany || undefined,
        afInsurer: values.afInsurer || undefined,
        afVehicleRego: values.afVehicleRego || undefined,
        afVehicleMake: values.afVehicleMake || undefined,
        afVehicleModel: values.afVehicleModel || undefined,
        afVehicleYear: values.afVehicleYear || undefined,
        
        accidentDate: values.accidentDate || undefined,
        accidentTime: values.accidentTime || undefined,
        accidentLocation: values.accidentLocation || undefined,
        accidentDescription: values.accidentDescription || undefined,
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating case:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* NAF Client Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Not At Fault (NAF) Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nafName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafSuburb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {australianStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafPostcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafVehicleRego"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Registration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafVehicleMake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Make</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nafVehicleModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* AF Party Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              At Fault (AF) Party Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="afName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>At Fault Party Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afVehicleRego"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Registration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afVehicleMake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Make</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afVehicleModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="afInsuranceCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Accident Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Accident Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="accidentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accident Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accidentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accident Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accidentLocation"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Accident Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Case...
              </>
            ) : (
              "Create Case"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
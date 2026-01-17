
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { JobPosting } from '@/entities/JobPosting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Briefcase, MapPin, ListChecks } from 'lucide-react';

export default function PostGig() {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const jobData = {
        ...data,
        pay_rate: parseFloat(data.pay_rate),
        duration_hours: parseFloat(data.duration_hours),
        location_latitude: parseFloat(data.location_latitude),
        location_longitude: parseFloat(data.location_longitude),
      };
      await JobPosting.create(jobData);
      toast.success("Your job has been posted successfully!");
      navigate(createPageUrl('DayLaborHub'));
    } catch (error) {
      console.error("Failed to post job:", error);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const jobTypes = ["construction", "landscaping", "cleaning", "moving", "painting", "roofing", "plumbing", "electrical", "carpentry", "demolition", "general_labor", "warehouse", "delivery", "food_service", "retail", "office_work", "childcare", "eldercare", "pet_care", "handyman", "auto_repair", "farming", "events", "photography"];
  const requirements = ["no_experience", "some_experience", "experienced", "own_tools", "own_vehicle", "background_check", "drug_test", "physical_strength", "valid_license"];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Job Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" {...register("description", { required: "Description is required" })} rows={4} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="job_type">Job Type</Label>
              <Controller
                name="job_type"
                control={control}
                rules={{ required: "Job type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a job type" /></SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.job_type && <p className="text-red-500 text-xs mt-1">{errors.job_type.message}</p>}
            </div>
            <div>
              <Label htmlFor="pay_rate">Hourly Pay Rate ($)</Label>
              <Input id="pay_rate" type="number" step="0.01" {...register("pay_rate", { required: "Pay rate is required", valueAsNumber: true })} />
              {errors.pay_rate && <p className="text-red-500 text-xs mt-1">{errors.pay_rate.message}</p>}
            </div>
            <div>
              <Label htmlFor="duration_hours">Estimated Duration (hours)</Label>
              <Input id="duration_hours" type="number" step="0.5" {...register("duration_hours", { required: "Duration is required", valueAsNumber: true })} />
              {errors.duration_hours && <p className="text-red-500 text-xs mt-1">{errors.duration_hours.message}</p>}
            </div>
             <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register("start_date", { required: "Start date is required" })} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Location</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="location_description">Location Description</Label>
              <Input id="location_description" {...register("location_description")} placeholder="e.g., Downtown, 123 Main St" />
            </div>
            <div>
              <Label htmlFor="location_latitude">Latitude</Label>
              <Input id="location_latitude" {...register("location_latitude", { required: "Latitude is required" })} placeholder="e.g., 26.72" />
              {errors.location_latitude && <p className="text-red-500 text-xs mt-1">{errors.location_latitude.message}</p>}
            </div>
            <div>
              <Label htmlFor="location_longitude">Longitude</Label>
              <Input id="location_longitude" {...register("location_longitude", { required: "Longitude is required" })} placeholder="e.g., -81.89" />
              {errors.location_longitude && <p className="text-red-500 text-xs mt-1">{errors.location_longitude.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5" /> Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Check all that apply</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {requirements.map(req => (
                <div key={req} className="flex items-center space-x-2">
                  <Controller
                    name={`requirements.${req}`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox id={req} onCheckedChange={field.onChange} checked={field.value} />
                    )}
                  />
                  <Label htmlFor={req} className="font-normal capitalize">{req.replace('_', ' ')}</Label>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Controller
                name="tools_provided"
                control={control}
                render={({ field }) => (
                  <Checkbox id="tools_provided" onCheckedChange={field.onChange} checked={field.value} />
                )}
              />
              <Label htmlFor="tools_provided">Tools will be provided</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}

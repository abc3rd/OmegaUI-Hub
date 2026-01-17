
import React, { useState, useEffect, useMemo } from 'react';
import { JobPosting } from '@/entities/JobPosting';
import { WorkerProfile } from '@/entities/WorkerProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Briefcase, Users, Search, MapPin, Star, Clock, PlusCircle } from 'lucide-react';

const JobCard = ({ job }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-bold text-gray-800">{job.title}</CardTitle>
      <div className="flex items-center gap-2 pt-2">
        <Badge variant="secondary" className="capitalize">{job.job_type.replace('_', ' ')}</Badge>
        <Badge variant="outline">${job.pay_rate}/hr</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{job.location_description || 'Location not specified'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{job.duration_hours} hours</span>
        </div>
      </div>
      <Button className="w-full mt-2">View Job & Apply</Button>
    </CardContent>
  </Card>
);

const WorkerCard = ({ worker }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-bold text-gray-800">{worker.display_name}</CardTitle>
      <div className="flex items-center gap-2 pt-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-bold">{worker.rating ? worker.rating.toFixed(1) : 'New'}</span>
        </div>
        <Badge variant="outline">${worker.hourly_rate_min}-${worker.hourly_rate_max}/hr</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-gray-600 line-clamp-2">{worker.description}</p>
      <div className="flex flex-wrap gap-2">
        {worker.skills?.slice(0, 3).map(skill => (
          <Badge key={skill} variant="secondary" className="capitalize">{skill.replace(/_/g, ' ')}</Badge>
        ))}
      </div>
      <Button className="w-full mt-2">View Profile & Hire</Button>
    </CardContent>
  </Card>
);

export default function DayLaborHub() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [jobsData, workersData] = await Promise.all([
          JobPosting.filter({ status: 'open' }),
          WorkerProfile.filter({ is_available: true }),
        ]);
        setJobs(jobsData);
        setWorkers(workersData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load hub data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const searchTermMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
      const jobTypeMatch = jobTypeFilter === 'all' || job.job_type === jobTypeFilter;
      return searchTermMatch && jobTypeMatch;
    });
  }, [jobs, searchTerm, jobTypeFilter]);

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const searchTermMatch = worker.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || worker.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const jobTypeMatch = jobTypeFilter === 'all' || worker.skills.includes(jobTypeFilter);
      return searchTermMatch && jobTypeMatch;
    });
  }, [workers, searchTerm, jobTypeFilter]);

  const jobTypes = useMemo(() => [...new Set(jobs.map(j => j.job_type))], [jobs]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Day Labor Hub</h1>
        <p className="text-gray-600 mt-1">Find local jobs or hire skilled workers for your next project.</p>
      </header>

      <Tabs defaultValue="find-job">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="find-job"><Briefcase className="w-4 h-4 mr-2" />Find a Job</TabsTrigger>
            <TabsTrigger value="find-worker"><Users className="w-4 h-4 mr-2" />Find a Worker</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button asChild>
              <Link to={createPageUrl('WorkerProfile')}><Users className="w-4 h-4 mr-2" />My Profile</Link>
            </Button>
            <Button asChild>
              <Link to={createPageUrl('PostGig')}><PlusCircle className="w-4 h-4 mr-2" />Post a Job</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by keyword, skill, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="w-4 h-4 text-gray-400" />}
              />
            </div>
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                {jobTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="find-job">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => <JobCard key={job.id} job={job} />)
            ) : (
              <p className="text-gray-500 md:col-span-3 text-center">No open jobs match your search.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="find-worker">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map(worker => <WorkerCard key={worker.id} worker={worker} />)
            ) : (
              <p className="text-gray-500 md:col-span-3 text-center">No available workers match your search.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

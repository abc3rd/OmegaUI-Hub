
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { WorkerProfile } from '@/entities/WorkerProfile';
import { PaymentTransaction } from '@/entities/PaymentTransaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { Star, MapPin, DollarSign, Briefcase, MessageSquare, Wrench, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function WorkerProfilePage() {
    const { workerId } = useParams();
    const [worker, setWorker] = useState(null);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!workerId) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            try {
                const workerData = await WorkerProfile.get(workerId);
                setWorker(workerData);

                // This is a placeholder for fetching reviews/completed jobs
                // In a real app, you'd filter PaymentTransaction by worker_profile_id
                const allTransactions = await PaymentTransaction.list(); 
                const workerTransactions = allTransactions.filter(t => t.worker_profile_id === workerId && t.employer_feedback);
                setCompletedJobs(workerTransactions);

            } catch (error) {
                console.error("Failed to load worker profile:", error);
                toast.error("Could not load worker profile.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [workerId]);

    if (loading) {
        return <div className="p-6 text-center">Loading Worker Profile...</div>;
    }

    if (!worker) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-destructive">Worker Not Found</h2>
                <p className="text-muted-foreground">The requested worker profile does not exist.</p>
                <Button asChild className="mt-4">
                    <Link to={createPageUrl('DayLaborHub')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hub
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto space-y-6">
            <Link to={createPageUrl('DayLaborHub')} className="flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Day Labor Hub
            </Link>

            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={worker.profile_image_url || ''} alt={worker.display_name} />
                        <AvatarFallback className="text-3xl bg-muted">{worker.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-3xl font-bold">{worker.display_name}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-lg">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold">{worker.rating?.toFixed(1) || 'New'}</span>
                                <span className="text-sm text-muted-foreground">({worker.completed_jobs} jobs)</span>
                            </div>
                            <div className="flex items-center gap-1 text-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="font-bold">{worker.hourly_rate_min}-{worker.hourly_rate_max}/hr</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground mt-2">{worker.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                         <Button className="w-full"><MessageSquare className="w-4 h-4 mr-2"/> Contact & Hire</Button>
                         <Button variant="outline" className="w-full">Share Profile</Button>
                    </div>
                </CardHeader>
                <CardContent className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary"/> Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {worker.skills?.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-base capitalize">{skill.replace(/_/g, ' ')}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-primary"/> Location & Availability</h3>
                        <p>Travels up to {worker.travel_radius} miles.</p>
                         <div className="flex items-center gap-2">
                            {worker.verification_status === 'background_checked' && <Badge className="bg-green-100 text-green-800"><ShieldCheck className="w-3 h-3 mr-1"/> Background Checked</Badge>}
                            {worker.is_available && <Badge className="bg-blue-100 text-blue-800">Available Now</Badge>}
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><Wrench className="w-5 h-5 text-primary"/> Equipment</h3>
                         <div className="flex flex-wrap gap-2">
                            {worker.available_equipment?.map(e => (
                                <Badge key={e} variant="outline" className="capitalize">{e.replace(/_/g, ' ')}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Work History & Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {completedJobs.length > 0 ? (
                        completedJobs.map(job => (
                            <div key={job.id} className="p-4 border rounded-lg bg-muted/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">Rating:</span>
                                            <div className="flex items-center">
                                                {Array.from({length: 5}).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < job.employer_rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}/>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm italic">"{job.employer_feedback}"</p>
                                    </div>
                                    <Badge variant="outline">{format(new Date(job.completion_date), 'MMM yyyy')}</Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No work history or reviews yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

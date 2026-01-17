import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added import for Button
import { Loader2, Heart, Gift, Download, HelpCircle, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MyDonations() {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: () => base44.auth.me()
    });

    const { data: donations = [], isLoading: donationsLoading } = useQuery({
        queryKey: ['myDonations', user?.id],
        queryFn: () => base44.entities.Donation.filter({ donorUserId: user.id, status: 'completed' }, '-created_date'),
        enabled: !!user
    });

    const currentYear = new Date().getFullYear();
    const yearlyDonations = React.useMemo(() => {
        const years = {};
        donations.forEach(d => {
            const year = new Date(d.created_date).getFullYear();
            if (!years[year]) years[year] = [];
            years[year].push(d);
        });
        return years;
    }, [donations]);

    const yearlyTotals = React.useMemo(() => {
        const totals = {};
        Object.keys(yearlyDonations).forEach(year => {
            totals[year] = yearlyDonations[year].reduce((sum, d) => sum + d.grossAmount, 0);
        });
        return totals;
    }, [yearlyDonations]);

    const { data: profiles = [] } = useQuery({
        queryKey: ['allProfilesForDonations'],
        queryFn: () => base44.entities.Profile.list(),
        enabled: donations.length > 0
    });

    const getProfileName = (profileId) => {
        const profile = profiles.find(p => p.id === profileId);
        return profile ? profile.publicName : "a recipient";
    };

    const exportToCSV = async (year = null) => {
        try {
            const { data } = await base44.functions.invoke('exportDonationsCsv', { year });
            const blob = new Blob([data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cloud-collect-donations-${year || 'all'}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`${year || 'All'} donations exported for tax filing!`);
        } catch (error) {
            toast.error('Failed to export donations');
        }
    };

    const downloadReceipt = async (donationId) => {
        try {
            const { data } = await base44.functions.invoke('generateDonationReceipt', { donationId });
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${donationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Receipt downloaded!');
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">My Donations</h1>
                        <p className="text-slate-600">Track your contributions for tax purposes</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Tax Filing Help
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Tax Deduction Information</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">📊 Using TurboTax</h4>
                                    <ol className="text-sm text-blue-800 space-y-2 list-decimal ml-4">
                                        <li>Export your yearly donation history using the year buttons below</li>
                                        <li>Open TurboTax and navigate to "Deductions & Credits"</li>
                                        <li>Select "Charitable Donations" or "Gifts to Charity"</li>
                                        <li>Enter each donation manually or upload your CSV file</li>
                                        <li>Download individual receipts if needed for verification</li>
                                    </ol>
                                </div>
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-900 mb-2">💡 Other Tax Software</h4>
                                    <p className="text-sm text-green-800 mb-2">
                                        Most tax software (H&R Block, FreeTaxUSA, TaxAct) accepts charitable donation data:
                                    </p>
                                    <ul className="text-sm text-green-800 space-y-1 list-disc ml-4">
                                        <li>Look for "Itemized Deductions" or "Schedule A"</li>
                                        <li>Find "Charitable Contributions" section</li>
                                        <li>Use your exported CSV to enter donation details</li>
                                    </ul>
                                </div>
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Tax Disclaimer</h4>
                                    <p className="text-sm text-amber-800">
                                        Cloud QR facilitates peer-to-peer giving. Tax deductibility depends on the recipient's status 
                                        and your individual tax situation. Always consult with a qualified tax professional to determine 
                                        if your donations qualify for deductions in your jurisdiction.
                                    </p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Tax Year Summary Cards */}
            {Object.keys(yearlyTotals).length > 0 && (
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {Object.keys(yearlyTotals).sort((a, b) => b - a).map(year => (
                        <Card key={year} className={year == currentYear ? "border-2 border-blue-500" : ""}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Tax Year {year}</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ${yearlyTotals[year].toFixed(2)}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {yearlyDonations[year].length} donation{yearlyDonations[year].length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-slate-300" />
                                </div>
                                <Button 
                                    onClick={() => exportToCSV(year)} 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export {year}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Your Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                    {donationsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <Gift className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700">No Donations Yet</h3>
                            <p className="text-slate-500 mt-2">
                                Your contributions will appear here once you make them.
                            </p>
                            <Link to={createPageUrl("Home")}>
                                <Button className="mt-4">Find someone to support</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map(donation => (
                                <div key={donation.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <Heart className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    <span className="text-green-600">${donation.grossAmount.toFixed(2)}</span> to {getProfileName(donation.profileId)}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(donation.created_date).toLocaleDateString()} • Tax Year {new Date(donation.created_date).getFullYear()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => downloadReceipt(donation.id)}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Receipt
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
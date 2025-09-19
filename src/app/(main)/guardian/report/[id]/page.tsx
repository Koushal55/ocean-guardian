'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, User, Camera, Satellite, Ship, CheckCircle, XCircle, Download } from "lucide-react";


// Expanded Report interface to match our populated data
interface Report {
  _id: string;
  hazardType: string;
  location: string;
  description: string;
  vesselInfo?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  createdAt: string;
  submittedBy: { name: string; email: string; };
}


function AICopilotAnalysis({ description, location }: { description: string; location: string }) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");

  useEffect(() => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async function simulateAnalysis() {
      await sleep(2000); // ⏳ wait 2s
      setAnalysis(
        `⚡ Potential illegal activity detected near ${location}. 
        Description suggests: "${description}". 
        Recommend coastal guard investigation.`
      );
      setLoading(false);
    }

    simulateAnalysis();
  }, [description, location]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Satellite className="h-5 w-5 mr-2" />AI Co-pilot Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-gray-700 py-8">
        {loading ? (
          <p className="animate-pulse text-gray-500">Analyzing report with AI Co-pilot...</p>
        ) : (
          <p>{analysis}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for the timeline to match the design
  const mockTimeline = [
    { time: "14:30", event: "Initial report submitted" },
    { time: "14:31", event: "AI Co-pilot analysis initiated" },
    { time: "14:45", event: "Status changed to 'Investigating'" }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) {
      router.push('/login');
      return;
    };

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch report details.');
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error(error);
        router.push('/guardian/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [id, router]);



  const handleAction = async (newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`Failed to ${newStatus} report.`);
      
      const data = await res.json();
      setReport(data.report);
      alert(`Report successfully marked as ${newStatus}.`);

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };
  
  const getUrgencyColor = (urgency: string = 'low') => {
    if (urgency === "critical") return "bg-red-500 text-white";
    if (urgency === "high") return "bg-orange-500 text-white";
    if (urgency === "medium") return "bg-yellow-500 text-black";
    return "bg-green-500 text-white";
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading Report Details...</div>;
  if (!report) return <div className="flex justify-center items-center min-h-screen">Report not found or access denied.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/guardian/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Command Center
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{report.hazardType.replace('-', ' ')} Report</h1>
                <div className="flex items-center space-x-4">
                  <Badge className={getUrgencyColor(report.urgency)}>{report.urgency.toUpperCase()} PRIORITY</Badge>
                  <Badge variant="outline" className="capitalize">{report.status}</Badge>
                  <span className="text-sm text-gray-500">Reported {new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={() => handleAction("dismissed")} variant="outline"><XCircle className="h-4 w-4 mr-2" />Dismiss</Button>
                <Button onClick={() => handleAction("verified")} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="h-4 w-4 mr-2" />Verify Threat</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Reported Incident</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{report.description}</p>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center"><MapPin className="h-4 w-4 mr-2" />Location</h5>
                      <p className="text-sm text-gray-600">{report.location}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2 flex items-center"><Ship className="h-4 w-4 mr-2" />Vessel Information</h5>
                      <p className="text-sm text-gray-600">{report.vesselInfo || 'Not provided'}</p>
                    </div>
                  </div>
                  <Separator />
                  {/* NEW: Submitted Evidence Section */}
                  <div>
                    <h5 className="font-semibold mb-2 flex items-center"><Camera className="h-4 w-4 mr-2" />Submitted Evidence</h5>
                    <div className="p-4 bg-gray-100 rounded-md text-center text-sm text-gray-500">
                      Photo/video evidence feature will be enabled in a future update.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center"><Satellite className="h-5 w-5 mr-2" />AI Co-pilot Analysis</CardTitle></CardHeader>
                <CardContent className="text-center text-gray-500 py-8">
                    <AICopilotAnalysis description={report.description} location={report.location} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center text-base"><User className="h-4 w-4 mr-2" />Reporter Information</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-semibold">{report.submittedBy?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">{report.submittedBy?.email || 'No contact info'}</p>
                </CardContent>
              </Card>
              
              {/* NEW: Investigation Timeline */}
              <Card>
                <CardHeader><CardTitle className="flex items-center text-base"><Clock className="h-4 w-4 mr-2" />Investigation Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTimeline.map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium">{item.event}</p>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* NEW: Quick Actions */}
              <Card>
                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled><Download className="h-4 w-4 mr-2" />Download Report</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled><MapPin className="h-4 w-4 mr-2" />View on Map</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled><Ship className="h-4 w-4 mr-2" />AIS Vessel Search</Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled><Satellite className="h-4 w-4 mr-2" />Request Satellite</Button>
                </CardContent>
              </Card>
              {/* NEW: Quick Actions */}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={async () => {
                      const confirmSend = confirm("Found nearest coastal guard in Vizag. Send alert?");
                      if (!confirmSend) return;

                      try {
                        const res = await fetch("/api/send-alert", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            message: `🚨 Hazard reported: ${report.description} at ${report.location}`,
                          }),
                        });

                        const data = await res.json();
                        if (data.success) {
                          alert("✅ Alert successfully sent to Vizag Coastal Guard!");
                        } else {
                          alert(`❌ Failed: ${data.error}`);
                        }
                      } catch (err: any) {
                        alert(`❌ Error: ${err.message}`);
                      }
                    }}
                  >
                    🚨 Send Alert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
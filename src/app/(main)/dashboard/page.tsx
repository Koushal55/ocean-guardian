'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link"; // Corrected for Next.js
import { Plus, MapPin, Clock, CheckCircle, AlertTriangle, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Define our data structures
interface TokenPayload {
  name: string;
}
interface Report {
  _id: string;
  hazardType: string;
  location: string;
  createdAt: string;
  status: 'submitted' | 'verified' | 'dismissed';
  description: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Decode token to get user's name
      const decodedToken = jwtDecode<TokenPayload>(token);
      setUserName(decodedToken.name);

      // Fetch the user's reports from our API
      const fetchMyReports = async () => {
        const res = await fetch('/api/reports/mine', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch reports');
        const data = await res.json();
        setReports(data);
      };

      fetchMyReports();
    } catch (error) {
      console.error('Session error:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "verified": return { color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case "submitted": return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="h-3 w-3 mr-1" /> };
      case "dismissed": return { color: "bg-gray-100 text-gray-800 border-gray-300", icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
      default: return { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <Clock className="h-3 w-3 mr-1" /> };
    }
  };

  // Dynamically calculate stats from fetched reports
  const totalReports = reports.length;
  const verifiedReports = reports.filter(r => r.status === 'verified').length;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section from Lovable.ai design */}
      <section className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}</h1>
              <p className="text-white/80">Thank you for helping protect our oceans.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats & Quick Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Your Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{totalReports}</div>
                  <div className="text-sm text-gray-500">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{verifiedReports}</div>
                  <div className="text-sm text-gray-500">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-blue-600 text-white">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Spotted a marine threat?</h3>
                <p className="text-blue-100">Report it now and help protect our oceans.</p>
              </div>
              <Link href="/report">
                <Button size="lg" variant="secondary">
                  <Plus className="h-5 w-5 mr-2" />
                  Report Hazard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Reports</CardTitle>
            <CardDescription>Track the status of your submissions and their impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  return (
                    <div key={report._id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold capitalize">{report.hazardType.replace('-', ' ')}</h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate">{report.description}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{report.location}</span>
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                  <Link href="/report"><Button>Report Your First Hazard</Button></Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Added
import Link from "next/link";
import { Shield, MapPin, Clock, Filter, Search, MoreHorizontal, Users, Zap, AlertTriangle, TrendingUp, Eye } from "lucide-react"; // Added/Re-added icons
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { X } from "lucide-react"; // Import Twitter Icon  

interface SocialMention {
  _id: string;
  text: string;
  created_at: string;
}

// Define our data structures
interface DecodedToken {
  role: string;
}
interface Report {
  _id: string;
  hazardType: string;
  location: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical'; // Explicit urgency types
  status: 'submitted' | 'verified' | 'dismissed' | 'investigating' | 'pending' | 'escalated'; // More specific statuses
  createdAt: string;
  submittedBy: { name: string };
  // Mocked for now, will be real data from backend/AI in future
  aiConfidence?: number;
  vesselCount?: number;
}
// Dynamically import the MapComponent
const Map = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-100 font-semibold">Loading Map...</div>
});

// Define our data structures
interface DecodedToken {
  role: string;
}

export default function GuardianDashboard() {
  const [socialMentions, setSocialMentions] = useState<SocialMention[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [hotspots, setHotspots] = useState([]);

  // State for filters
  const [dateFilter, setDateFilter] = useState("all"); // Added date filter state
  const [typeFilter, setTypeFilter] = useState("all"); // Added type filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.role !== 'official') {
      router.push('/dashboard'); // Redirect non-officials
      return;
    }

    const fetchAllReports = async () => {
      try {
        // Now fetch reports, hotspots, AND social mentions
        const [reportsRes, hotspotsRes, mentionsRes] = await Promise.all([
          fetch('/api/reports/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/hotspots'),
          fetch('/api/social-mentions', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!reportsRes.ok) throw new Error('Failed to fetch reports.');
        if (!hotspotsRes.ok) throw new Error('Failed to fetch hotspots.');
        if (!mentionsRes.ok) throw new Error('Failed to fetch social mentions.');

        const reportsData = await reportsRes.json();
        const hotspotsData = await hotspotsRes.json();
        const mentionsData = await mentionsRes.json();
        setSocialMentions(mentionsData);
        
        // Add mock AI confidence and vessel count for display purposes
        const reportsWithMockData = reportsData.map((report: { aiConfidence: any; vesselCount: any; hazardType: string; urgency: any; status: string; }) => ({
          ...report,
          aiConfidence: report.aiConfidence ?? Math.floor(Math.random() * (99 - 60 + 1)) + 60, // 60-99%
          vesselCount: report.vesselCount ?? (report.hazardType === 'illegal-fishing' || report.hazardType === 'oil-spill' ? Math.floor(Math.random() * 4) + 1 : 0),
          // Set default urgency if not present (assuming for submitted reports)
          urgency: report.urgency || (report.status === 'submitted' ? 'medium' : 'low'), 
          status: report.status === 'submitted' ? 'pending' : report.status, // Match 'submitted' to 'pending' for initial display
        }));

        setAllReports(reportsWithMockData);
        setFilteredReports(reportsWithMockData);
        setHotspots(hotspotsData); // Set the hotspots state
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllReports();
  }, [router]);

    const Map = dynamic(() => import('@/components/MapComponent'), { 
      ssr: false,
      loading: () => <div className="flex items-center justify-center h-full bg-gray-100">Loading map...</div>
    });

  useEffect(() => {
    let reports = [...allReports];
    if (statusFilter !== "all") {
      reports = reports.filter(report => report.status === statusFilter);
    }
    if (searchQuery) {
      reports = reports.filter(report =>
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredReports(reports);
  }, [statusFilter, searchQuery, allReports]);

  // This stats object calculation remains the same
const stats = {
  // FIX: Active reports are anything not yet verified or dismissed
  activeReports: allReports.filter(r => r.status !== 'verified' && r.status !== 'dismissed').length,
  verifiedToday: allReports.filter(r => {
      const today = new Date();
      const reportDate = new Date(r.createdAt);
      return r.status === 'verified' && reportDate.toDateString() === today.toDateString();
  }).length,
  responseTime: "8 min", // Placeholder for now
  hotspots: hotspots.length,
};
  const getUrgencyBorderColor = (urgency: string = 'low') => {
  if (urgency === "critical") return "border-red-500";
  if (urgency === "high") return "border-orange-500";
  if (urgency === "medium") return "border-yellow-500";
  return "border-gray-400";
};
  // Helper functions for styling from the design
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800 border-green-300";
      case "investigating": return "bg-blue-100 text-blue-800 border-blue-300";
      case "escalated": return "bg-red-100 text-red-800 border-red-300";
      case "pending": // Maps to 'submitted'
      case "submitted": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "dismissed": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Helper to format time ago (optional, for "2 minutes ago" look)
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading Command Center...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section from Lovable.ai design */}
      <section className="pt-8 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Guardian Command Center</h1>
              <p className="text-white/80">Real-time ocean threat monitoring and response coordination</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Shield className="h-3 w-3 mr-1" />
                Maritime Authority
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reports</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeReports}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verifiedToday}</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold text-foreground">{stats.responseTime}</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Hotspots</p>
                  <p className="text-2xl font-bold text-red-600">{stats.hotspots}</p>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Map Area */}
          <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Live Threat Map</CardTitle>
                  <CardDescription>Real-time visualization of reported threats.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* The live map component is called here */}
                  <div className="h-[600px] w-full rounded-lg border overflow-hidden">
                    {/* Pass both reports and hotspots to the map */}
                    <Map reports={filteredReports} hotspots={hotspots} />
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Reports Panel */}
          <div>
            <Tabs defaultValue="citizen-reports" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="citizen-reports">Citizen Reports</TabsTrigger>
                <TabsTrigger value="social-media">Social Media</TabsTrigger>
              </TabsList>

              {/* Tab 1: Citizen Reports */}
              <TabsContent value="citizen-reports">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Incoming Reports</CardTitle>
                        <CardDescription>Latest citizen reports requiring attention</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search reports..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {filteredReports.length > 0 ? (
                        filteredReports.map((report) => (
                          <Link key={report._id} href={`/guardian/report/${report._id}`}>
                            <Card className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${getUrgencyBorderColor(report.urgency)}`}>
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getUrgencyColor(report.urgency)}>{report.urgency.toUpperCase()}</Badge>
                                    <Badge className={getStatusBadgeColor(report.status)}>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</Badge>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 capitalize">{report.hazardType.replace('-', ' ')}</h4>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{report.description}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="font-medium truncate">{report.submittedBy?.name || 'Unknown'}</span>
                                  <span>{timeAgo(report.createdAt)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                          <p>No reports match the current filters.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Social Media Mentions */}
              <TabsContent value="social-media">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Mentions</CardTitle>
                    <CardDescription>Potential hazards detected on Twitter/X</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
                    {socialMentions.length > 0 ? (
                      socialMentions.map((mention) => (
                        <Card key={mention._id} className="p-3">
                          <div className="flex items-start space-x-3">
                            <X className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm">{mention.text}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(mention.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p>No social media mentions found yet. Run the Python script to gather data.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
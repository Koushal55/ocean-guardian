import { Card, CardContent } from "@/components/ui/card";
import { Shield, Globe, Users, Zap, Eye, Target } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* The <Navigation/> component is removed as our layout handles it */}
      
      {/* Header */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Ocean Guardian
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            We're on a mission to protect our oceans through technology, community action, and rapid response coordination.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ocean Guardian was created to address the critical gap in marine protection through real-time monitoring and community engagement. We believe that by combining citizen reporting with advanced AI technology, we can create a more effective defense against ocean threats.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our platform empowers everyday people to become guardians of the sea while providing maritime authorities with the tools they need for rapid, informed response.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-4">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
                  <div className="text-sm text-gray-500">Protection</div>
                </CardContent>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-4">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">Global</div>
                  <div className="text-sm text-gray-500">Coverage</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">The Ocean Crisis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our oceans face unprecedented threats that require immediate, coordinated action.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow"><CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Illegal, Unreported & Unregulated (IUU) Fishing</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>Accounts for up to 26 million tonnes of fish annually</li>
                  <li>Causes $23.5 billion per year in economic losses</li>
                  <li>Destroys marine ecosystems and food security</li>
                </ul>
              </CardContent></Card>
            <Card className="p-8 hover:shadow-lg transition-shadow"><CardContent>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Marine Pollution</h3>
                <ul className="space-y-2 text-gray-600 list-disc list-inside">
                  <li>8 million tonnes of plastic enter oceans yearly</li>
                  <li>Chemical spills and waste threaten marine life</li>
                  <li>Microplastics contaminate the entire food chain</li>
                </ul>
              </CardContent></Card>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Technology Solution</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage cutting-edge AI and crowdsourcing to create a comprehensive monitoring network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow"><CardContent className="pt-6">
                <div className="mb-6 inline-block p-4 bg-blue-600 rounded-full"><Users className="h-8 w-8 text-white" /></div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Crowdsourced Reporting</h3>
                <p className="text-gray-600">Citizens and fishermen report threats through our platform, creating eyes everywhere.</p>
              </CardContent></Card>
            <Card className="text-center p-8 hover:shadow-lg transition-shadow"><CardContent className="pt-6">
                <div className="mb-6 inline-block p-4 bg-blue-600 rounded-full"><Zap className="h-8 w-8 text-white" /></div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Co-pilot Analysis</h3>
                <p className="text-gray-600">Algorithms process reports and social media to verify and enrich reports for authorities.</p>
              </CardContent></Card>
            <Card className="text-center p-8 hover:shadow-lg transition-shadow"><CardContent className="pt-6">
                <div className="mb-6 inline-block p-4 bg-blue-600 rounded-full"><Eye className="h-8 w-8 text-white" /></div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Real-time Monitoring</h3>
                <p className="text-gray-600">Authorities receive instant alerts with actionable intelligence to coordinate response.</p>
              </CardContent></Card>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4 inline-block p-4 bg-white/10 rounded-full"><Target className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-semibold mb-3">Reduce IUU Fishing</h3>
              <p className="text-white/80">Decrease illegal fishing through enhanced detection and rapid response.</p>
            </div>
            <div>
              <div className="mb-4 inline-block p-4 bg-white/10 rounded-full"><Shield className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-semibold mb-3">Protect Marine Life</h3>
              <p className="text-white/80">Safeguard critical habitats and endangered species through early threat detection.</p>
            </div>
            <div>
              <div className="mb-4 inline-block p-4 bg-white/10 rounded-full"><Users className="h-8 w-8 text-white" /></div>
              <h3 className="text-xl font-semibold mb-3">Empower Communities</h3>
              <p className="text-white/80">Build a global network of ocean guardians equipped with the tools to protect their environment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
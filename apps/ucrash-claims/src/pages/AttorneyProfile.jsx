import React, { useState, useEffect } from 'react';
import { Star, Award, MapPin, Phone, Mail, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

export default function AttorneyProfile() {
  const [attorney, setAttorney] = useState(null);

  useEffect(() => {
    // Get attorney ID from URL
    const params = new URLSearchParams(window.location.search);
    const attorneyId = params.get('id');
    
    // Mock attorney data - in production, fetch from API
    const attorneys = {
      '1': {
        id: '1',
        name: "John D. Matthews, Esq.",
        firm: "Matthews Injury Law",
        specialty: "Commercial Truck & Auto Accidents",
        rating: 5,
        years: "20+",
        recovered: "$50M+",
        location: "Tampa, FL",
        phone: "(239) 247-6030",
        email: "contact@matthewsinjurylaw.com",
        image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c7757659586111f9e.png",
        bio: "John Matthews has been fighting for accident victims in Florida for over two decades. With a track record of recovering over $50 million for his clients, John specializes in complex truck and auto accident cases.",
        expertise: [
          "Commercial Truck Accidents",
          "Multi-Vehicle Collisions",
          "Catastrophic Injuries",
          "Wrongful Death Claims",
          "Insurance Bad Faith"
        ],
        education: [
          "J.D., University of Florida Levin College of Law",
          "B.A., Florida State University"
        ],
        awards: [
          "Super Lawyers Rising Star (2015-2020)",
          "Top 40 Under 40 Trial Lawyers",
          "Million Dollar Advocates Forum Member"
        ],
        cases: [
          { title: "Truck vs. Sedan Collision", result: "$3.2M Settlement", year: "2024" },
          { title: "Multi-Vehicle Highway Pileup", result: "$2.8M Verdict", year: "2023" },
          { title: "Commercial Vehicle Negligence", result: "$4.1M Settlement", year: "2023" }
        ]
      },
      '2': {
        id: '2',
        name: "Sarah Chen, Esq.",
        firm: "Chen & Associates Trial Lawyers",
        specialty: "Motorcycle & Pedestrian Accidents",
        rating: 5,
        years: "15+",
        recovered: "$35M+",
        location: "Miami, FL",
        phone: "(239) 247-6030",
        email: "contact@chenassociates.com",
        image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c02ab9b802613b593.png",
        bio: "Sarah Chen is a fierce advocate for motorcycle riders and pedestrian accident victims. Her aggressive trial approach has earned her respect in courtrooms across Florida.",
        expertise: [
          "Motorcycle Accidents",
          "Pedestrian Knockdowns",
          "Bicycle Accidents",
          "Hit and Run Cases",
          "Uninsured Motorist Claims"
        ],
        education: [
          "J.D., University of Miami School of Law",
          "B.S., Cornell University"
        ],
        awards: [
          "Top Women Lawyers in Florida",
          "Client's Choice Award 2023",
          "AVVO 10.0 Superb Rating"
        ],
        cases: [
          { title: "Motorcycle vs. Left-Turning Vehicle", result: "$2.1M Settlement", year: "2024" },
          { title: "Pedestrian Crosswalk Accident", result: "$1.9M Verdict", year: "2023" },
          { title: "Hit and Run Victim Recovery", result: "$1.5M Settlement", year: "2023" }
        ]
      },
      '3': {
        id: '3',
        name: "David Goldstein, Esq.",
        firm: "Goldstein Law Group",
        specialty: "Slip & Fall and Premises Liability",
        rating: 5,
        years: "25+",
        recovered: "$70M+",
        location: "Orlando, FL",
        phone: "(239) 247-6030",
        email: "contact@goldsteinlawgroup.com",
        image: "https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/6913e61c372f87a895b6c31a.png",
        bio: "With over 25 years of experience, David Goldstein has built a reputation as one of Florida's premier premises liability attorneys, holding property owners accountable.",
        expertise: [
          "Slip and Fall Accidents",
          "Premises Liability",
          "Negligent Security",
          "Swimming Pool Accidents",
          "Dog Bite Cases"
        ],
        education: [
          "J.D., Harvard Law School",
          "B.A., Yale University"
        ],
        awards: [
          "Best Lawyers in America (2018-2024)",
          "Martindale-Hubbell AV Rated",
          "Florida Justice Association Member"
        ],
        cases: [
          { title: "Grocery Store Slip & Fall", result: "$2.5M Settlement", year: "2024" },
          { title: "Apartment Complex Negligent Security", result: "$3.8M Verdict", year: "2023" },
          { title: "Restaurant Wet Floor Accident", result: "$1.2M Settlement", year: "2023" }
        ]
      }
    };
    
    setAttorney(attorneys[attorneyId] || attorneys['1']);
  }, []);

  if (!attorney) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-800">Loading attorney profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b-2 border-orange-500 shadow-lg" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <a href="/">
            <img 
              src="https://storage.googleapis.com/msgsndr/y4ABqxnk279eDc0f5DqY/media/691c36a0c20a256df3ab1ad8.svg" 
              alt="u-CRA$H Logo" 
              className="h-16 w-auto cursor-pointer"
            />
          </a>
          <a
            href="/#book-consultation"
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold hover:scale-105 transition-transform"
          >
            Book Free Consultation
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1">
              <div 
                className="h-96 md:h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${attorney.image})` }}
              />
            </div>
            <div className="md:col-span-2 p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-600" />
                <span className="text-gray-600 font-semibold">{attorney.location}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">{attorney.name}</h1>
              <p className="text-2xl text-orange-600 font-bold mb-4">{attorney.firm}</p>
              <p className="text-xl text-gray-700 mb-6">{attorney.specialty}</p>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(attorney.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-current text-orange-500" />
                  ))}
                </div>
                <div className="border-l-2 border-gray-300 pl-6">
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-2xl font-bold text-blue-600">{attorney.years}</p>
                </div>
                <div className="border-l-2 border-gray-300 pl-6">
                  <p className="text-sm text-gray-600">Recovered</p>
                  <p className="text-2xl font-bold text-green-600">{attorney.recovered}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`tel:${attorney.phone}`}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {attorney.phone}
                </a>
                <a
                  href={`mailto:${attorney.email}`}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full font-bold hover:bg-gray-700 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
                <a
                  href="/#book-consultation"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                  <Calendar className="w-5 h-5" />
                  Book Consultation
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">About {attorney.name.split(',')[0]}</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{attorney.bio}</p>
            </div>

            {/* Areas of Expertise */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Areas of Expertise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attorney.expertise.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-800 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notable Cases */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Notable Case Results</h2>
              <div className="space-y-4">
                {attorney.cases.map((case_, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-6 py-3">
                    <h3 className="text-xl font-bold text-gray-800">{case_.title}</h3>
                    <p className="text-2xl font-black text-green-600 mb-1">{case_.result}</p>
                    <p className="text-sm text-gray-600">{case_.year}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 italic mt-6">
                Past results do not guarantee future outcomes. Each case is unique.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-600" />
                Education
              </h3>
              <ul className="space-y-3">
                {attorney.education.map((item, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Awards */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-600" />
                Awards & Recognition
              </h3>
              <ul className="space-y-3">
                {attorney.awards.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white text-center">
              <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
              <p className="mb-6">Free case review • No win, no fee</p>
              <a
                href="/#book-consultation"
                className="block px-6 py-3 bg-white text-orange-600 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Book Your Free Consultation
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-16 px-4 border-t-4 border-orange-600 mt-12" style={{ backgroundColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4 text-orange-600">Omega UI, LLC Network</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { name: 'Omega UI', url: 'https://www.omegaui.com' },
              { name: 'SynCloud', url: 'https://syncloud.omegaui.com' },
              { name: 'ABC Dashboard', url: 'https://www.ancdashboard.com' },
              { name: 'GLYTCH', url: 'https://glytch.cloud' },
              { name: 'GLYTCH Functions', url: 'https://glytch.cloud/functions' },
              { name: 'QR Generator', url: 'https://qr.omegaui.com' },
              { name: 'UI Tools', url: 'https://ui.omegaui.com' },
              { name: 'Cloud Convert', url: 'https://cloudconvert.omegaui.com' },
              { name: 'Chess', url: 'https://chess.omegaui.com' },
              { name: 'Echo', url: 'https://echo.omegaui.com' }
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-gray-600 hover:text-orange-600 text-sm transition-colors font-medium"
              >
                {link.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
          <p className="text-sm text-gray-600">&copy; 2025 u-CRA$H. All Rights Reserved. A Service of Omega UI, LLC</p>
        </div>
      </footer>
    </div>
  );
}
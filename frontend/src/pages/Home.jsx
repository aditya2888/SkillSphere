import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Monitor, Code, PenTool, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col gap-20 pb-16">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-12 mt-8 md:mt-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            v2.0 Beta Now Live
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-tight tracking-tight">
            Learn directly from <br className="hidden md:block"/>
            <span className="text-primary-500">industry experts.</span>
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
            A practical platform for university students to book 1-on-1 mentorship sessions, upload portfolios, and accelerate their career growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link to="/skills" className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              Browse Mentors <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
              Become a Mentor
            </Link>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-xl relative">
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl relative">
             <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
               <h3 className="text-zinc-100 font-semibold">Upcoming Sessions</h3>
               <span className="text-zinc-500 text-sm">View all</span>
             </div>
             
             <div className="space-y-4">
               <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-zinc-200">Advanced React Patterns</h4>
                    <span className="text-xs bg-primary-500/10 text-primary-400 px-2 py-1 rounded">Tomorrow, 10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-indigo-300 text-xs font-bold">JD</div>
                    <span>with John Doe</span>
                  </div>
               </div>

               <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-zinc-200">System Design Prep</h4>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Fri, 2:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <div className="w-6 h-6 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-300 text-xs font-bold">AS</div>
                    <span>with Alice Smith</span>
                  </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 py-10 border-y border-zinc-800/50">
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-bold text-zinc-100">500+</h4>
          <p className="text-zinc-500 text-sm mt-1">Active Mentors</p>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-bold text-zinc-100">10k+</h4>
          <p className="text-zinc-500 text-sm mt-1">Sessions Booked</p>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-bold text-zinc-100">4.9/5</h4>
          <p className="text-zinc-500 text-sm mt-1">Average Rating</p>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-bold text-zinc-100">50+</h4>
          <p className="text-zinc-500 text-sm mt-1">Universities</p>
        </div>
      </section>

      {/* Top Categories Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-100">Popular Categories</h2>
          <p className="text-zinc-400 mt-2">Find experts in exactly what you need to learn.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <Monitor className="text-primary-500" size={32} />
            <h3 className="font-medium text-zinc-200">Web Dev</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <PenTool className="text-pink-500" size={32} />
            <h3 className="font-medium text-zinc-200">Design</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <TrendingUp className="text-emerald-500" size={32} />
            <h3 className="font-medium text-zinc-200">Business</h3>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer flex flex-col items-center text-center gap-3">
            <Code className="text-purple-500" size={32} />
            <h3 className="font-medium text-zinc-200">Data Science</h3>
          </div>
        </div>
      </section>

      {/* Featured Mentors / Skills */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Featured Skills</h2>
            <p className="text-zinc-400 mt-2">Highly rated sessions available this week.</p>
          </div>
          <Link to="/skills" className="text-primary-500 hover:text-primary-400 text-sm font-medium hidden sm:block">
            View all skills &rarr;
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Mock Skill Card 1 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col">
            <div className="h-40 bg-zinc-800 relative">
              {/* Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-medium">Image Placeholder</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Engineering</span>
                <span className="flex items-center text-yellow-500 text-xs"><Star size={12} className="fill-current mr-1"/> 4.9 (120)</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1 group-hover:text-primary-400 transition-colors">Mastering Node.js Backends</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">Learn how to build scalable, production-ready APIs with Express and MongoDB.</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">SJ</div>
                  <span className="text-sm text-zinc-300">Sarah J.</span>
                </div>
                <span className="font-semibold text-zinc-100">$40/hr</span>
              </div>
            </div>
          </div>

          {/* Mock Skill Card 2 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col">
            <div className="h-40 bg-zinc-800 relative">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-medium">Image Placeholder</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Design</span>
                <span className="flex items-center text-yellow-500 text-xs"><Star size={12} className="fill-current mr-1"/> 5.0 (84)</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1 group-hover:text-primary-400 transition-colors">Figma Prototyping</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">A deep dive into variables, auto-layout, and interactive components.</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">MK</div>
                  <span className="text-sm text-zinc-300">Mike K.</span>
                </div>
                <span className="font-semibold text-zinc-100">$35/hr</span>
              </div>
            </div>
          </div>

          {/* Mock Skill Card 3 */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors group cursor-pointer flex flex-col">
            <div className="h-40 bg-zinc-800 relative">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-medium">Image Placeholder</div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Business</span>
                <span className="flex items-center text-yellow-500 text-xs"><Star size={12} className="fill-current mr-1"/> 4.8 (45)</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1 group-hover:text-primary-400 transition-colors">Startup Pitch Decks</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">How to craft a compelling story that gets investors to say yes.</p>
              
              <div className="mt-auto flex items-center justify-between border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">AL</div>
                  <span className="text-sm text-zinc-300">Anna L.</span>
                </div>
                <span className="font-semibold text-zinc-100">$50/hr</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-zinc-100 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <span className="font-semibold text-lg text-zinc-100 tracking-tight">SkillSphere</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              A platform for university students to share skills, find mentors, and collaborate on projects.
            </p>
          </div>
          
          <div>
            <h4 className="text-zinc-100 font-medium mb-4 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/skills" className="text-zinc-400 hover:text-primary-500 transition-colors">Browse Skills</Link></li>
              <li><Link to="/register" className="text-zinc-400 hover:text-primary-500 transition-colors">Become a Mentor</Link></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">How it Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-100 font-medium mb-4 text-sm">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">Community Guidelines</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">Student Discount</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-100 font-medium mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} SkillSphere. Built for CS-301.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <span className="sr-only">GitHub</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

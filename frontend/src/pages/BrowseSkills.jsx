import { useState, useEffect } from 'react';
import axios from 'axios';
import SkillCard from '../components/SkillCard';
import { Search } from 'lucide-react';

const BrowseSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const fetchSkills = async () => {
      try {
        const res = await axios.get(`${API}/skills`);
        setSkills(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const filteredSkills = skills.filter(skill =>
    skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Explore Skills</h1>
          <p className="text-zinc-400 mt-1">Find the perfect mentor to level up your abilities</p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Search by title or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-100">No skills found</h3>
          <p className="text-zinc-500 mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default BrowseSkills;

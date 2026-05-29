import { Link } from 'react-router-dom';
import { getFileUrl } from '../utils/api';
import { Star, Clock } from 'lucide-react';

const SkillCard = ({ skill }) => {
  return (
    <Link to={`/skills/${skill._id}`} className="group block h-full">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden h-full flex flex-col hover:border-zinc-700 transition-colors duration-200">
        <div className="relative h-48 bg-zinc-800 overflow-hidden">
          {skill.mediaUrl ? (
            <img
              src={getFileUrl(skill.mediaUrl)}
              alt={skill.title}
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.querySelector('.no-img-fallback')?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`no-img-fallback w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600 ${skill.mediaUrl ? 'hidden' : ''}`}>
            <span className="text-sm font-medium">No Image</span>
          </div>
          <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded border border-zinc-800 text-xs font-medium text-zinc-300">
            {skill.category}
          </div>
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg text-zinc-100 mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">
            {skill.title}
          </h3>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {skill.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold shadow-sm">
                {skill.user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-zinc-300 truncate w-24">
                {skill.user?.name || 'User'}
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">per session</span>
              <span className="font-bold text-zinc-100">${skill.price}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;

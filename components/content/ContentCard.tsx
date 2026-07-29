import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api-routes';

interface ContentCardProps {
  item: {
    id?: string;
    slug: string;
    title: string;
    posterUrl: string | null;
    releaseYear: number;
    rating: number;
  };
}

export default function ContentCard({ item }: ContentCardProps) {
  const imageUrl = item.posterUrl ? resolveImageUrl(item.posterUrl) : null;

  return (
    <Link href={`/film/${item.slug}`} className="block group cursor-pointer">
      <div className="relative aspect-[2/3] w-full rounded-[20px] overflow-hidden mb-3 bg-[var(--bg-panel)]">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={item.title} 
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
            <span className="text-[var(--text-muted)]">No Image</span>
          </div>
        )}
        
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      <div className="px-1">
        <h3 className="text-[var(--text-main)] font-bold text-[15px] truncate mb-1.5">{item.title}</h3>
        <div className="flex items-center text-[13px] text-[var(--text-muted)] gap-2">
          <span>{item.releaseYear || 'N/A'}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/50" />
          <div className="flex items-center gap-1">
            <Star size={12} fill="#FFD700" className="text-[#FFD700] mb-0.5" />
            <span className="text-[#FFD700] font-semibold">{item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

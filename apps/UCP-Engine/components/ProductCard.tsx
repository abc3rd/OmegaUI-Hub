
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group hover:border-[#ea00ea]/50 transition-all duration-300">
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#2699fe] border border-[#2699fe]/30">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-white group-hover:text-[#ea00ea] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2 mt-1 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#4bce2a] font-mono font-bold text-xl">
            ${product.price.toFixed(2)}
          </span>
          <button 
            onClick={() => onSelect?.(product.id)}
            className="px-3 py-1.5 rounded-lg border border-[#2699fe] text-[#2699fe] text-xs font-bold uppercase hover:bg-[#2699fe] hover:text-white transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

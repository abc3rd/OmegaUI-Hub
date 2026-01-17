import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FeedProduct } from '@/entities/FeedProduct';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FeedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animalFilter, setAnimalFilter] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const animal = params.get('animal');
    setAnimalFilter(animal);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let productList;
        if (animal) {
          productList = await FeedProduct.filter({ target_animal_types: { $in: [animal] } });
        } else {
          productList = await FeedProduct.list();
        }
        setProducts(productList);
      } catch (error) {
        console.error("Failed to load feed products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  return (
    <div className="p-4 md:p-6 w-full">
      <header className="flex items-center mb-8">
        <Link to={createPageUrl('AnimalNutrition')}>
          <Button variant="outline" size="icon" className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
            <h1 className="text-3xl font-bold text-foreground">
                {animalFilter ? `${animalFilter} Feed` : 'All Feed Products'}
            </h1>
            <p className="text-muted-foreground">Products from Sweet Cypress Ranch</p>
        </div>
      </header>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-8 bg-muted rounded w-1/2" />
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No Products Found</h2>
            <p className="text-muted-foreground mt-2">There are currently no feed products available for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Link key={product.id} to={createPageUrl(`FeedProductDetail?id=${product.id}`)}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.target_animal_types.map(animal => (
                        <Badge key={animal} variant="secondary">{animal}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
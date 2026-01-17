import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AnimalType } from '@/entities/AnimalType';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, PawPrint } from 'lucide-react';

export default function AnimalNutrition() {
  const [animalTypes, setAnimalTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimalTypes = async () => {
      try {
        const types = await AnimalType.list();
        setAnimalTypes(types);
      } catch (error) {
        console.error("Failed to load animal types:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimalTypes();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg aspect-[4/3]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full">
      <header className="mb-8 text-center">
        <PawPrint className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Animal Nutrition Hub</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select an animal to find specialized feeds from Sweet Cypress Ranch.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {animalTypes.map(animal => (
          <Link key={animal.id} to={createPageUrl(`FeedProducts?animal=${animal.name}`)}>
            <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className="relative aspect-[4/3]">
                <img src={animal.icon_url} alt={animal.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-white text-xl font-bold">
                  {animal.name}
                </h2>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link to={createPageUrl('FeedProducts')}>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            View All Products <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  PawPrint,
  Wheat,
  Target,
  ArrowRight,
  Heart,
  Scale,
  Truck
} from 'lucide-react';
import { AnimalType } from '@/entities/AnimalType';
import { FeedProduct } from '@/entities/FeedProduct';

export default function FarmRanchOverview() {
  const [farmStats, setFarmStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarmStats();
  }, []);

  const loadFarmStats = async () => {
    try {
      const [animalTypes, feedProducts] = await Promise.all([
        AnimalType.list(),
        FeedProduct.list()
      ]);

      setFarmStats({
        totalAnimalTypes: animalTypes.length,
        totalFeedProducts: feedProducts.length,
        avgPrice: feedProducts.length > 0 ? 
          Math.round(feedProducts.reduce((sum, product) => sum + (product.price || 0), 0) / feedProducts.length) : 0
      });
    } catch (error) {
      console.error('Failed to load farm stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
          <PawPrint className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Farm & Ranch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional animal nutrition guidance and feed product recommendations powered by Sweet Cypress Ranch expertise. 
            Ensure optimal health and performance for all your livestock and farm animals.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-amber-100 text-amber-800">Animal Nutrition</Badge>
          <Badge className="bg-orange-100 text-orange-800">Expert Guidance</Badge>
          <Badge className="bg-green-100 text-green-800">Premium Products</Badge>
        </div>
      </div>

      {/* Farm Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Animal Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <PawPrint className="w-8 h-8 text-amber-500" />
              <div className="text-2xl font-bold">{loading ? '...' : farmStats.totalAnimalTypes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Feed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Wheat className="w-8 h-8 text-green-500" />
              <div className="text-2xl font-bold">{loading ? '...' : farmStats.totalFeedProducts}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">${loading ? '...' : farmStats.avgPrice}</div>
                <div className="text-xs text-muted-foreground">per product</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">Premium</div>
                <div className="text-xs text-muted-foreground">Quality guarantee</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5" />
            What is Farm & Ranch?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Farm & Ranch provides expert animal nutrition guidance backed by Sweet Cypress Ranch's years of experience 
            in livestock care. Get personalized feed recommendations, nutritional analysis, and access to premium 
            products designed to keep your animals healthy, happy, and productive.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Expert Services:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Personalized nutrition consultations</li>
                <li>• Custom feed recommendations</li>
                <li>• Guaranteed nutritional analysis</li>
                <li>• Premium product sourcing</li>
                <li>• Seasonal feeding guidance</li>
                <li>• Health optimization programs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Ranch and farm owners</li>
                <li>• Livestock professionals</li>
                <li>• Horse and equine enthusiasts</li>
                <li>• Cattle and dairy operations</li>
                <li>• Small farm hobbyists</li>
                <li>• Animal health focused owners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Farm & Ranch Services</h2>
        <div className="grid md:grid-cols-1 gap-6">
          <Link to={createPageUrl('AnimalNutrition')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Animal Nutrition
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Get expert animal nutrition guidance from Sweet Cypress Ranch professionals. 
                  Receive personalized feed recommendations, nutritional analysis, and premium product suggestions 
                  tailored to your specific animals and their unique needs.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Expert Consultation</Badge>
                  <Badge variant="outline">Custom Recommendations</Badge>
                  <Badge variant="outline">Premium Products</Badge>
                  <Badge variant="outline">Health Optimization</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Sweet Cypress Ranch Partnership */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Powered by Sweet Cypress Ranch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Our Farm & Ranch services are powered by the expertise of Sweet Cypress Ranch, a trusted name in 
            livestock care and animal nutrition. With years of hands-on experience and a commitment to animal 
            health, they provide the knowledge and products you need to ensure your animals thrive.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-amber-800">Why Sweet Cypress Ranch?</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Years of practical livestock experience</li>
                <li>• Proven track record in animal health</li>
                <li>• Direct relationships with premium suppliers</li>
                <li>• Personalized approach to each animal</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-amber-800">What You Get:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Expert nutritional consultations</li>
                <li>• Access to premium feed products</li>
                <li>• Guaranteed product quality</li>
                <li>• Ongoing support and guidance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Animal Nutrition Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-amber-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Assess</h4>
              <p className="text-sm text-muted-foreground">Evaluate your animals' current health and nutritional needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Consult</h4>
              <p className="text-sm text-muted-foreground">Receive expert recommendations from Sweet Cypress Ranch</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Source</h4>
              <p className="text-sm text-muted-foreground">Access premium feed products and supplements</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Thrive</h4>
              <p className="text-sm text-muted-foreground">Watch your animals achieve optimal health and performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Animal Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Optimize your animals' health through expert nutrition guidance and premium products. 
              See improved vitality, performance, and overall well-being.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-blue-500" />
              Expert Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Benefit from Sweet Cypress Ranch's years of experience in livestock care. 
              Get personalized recommendations based on proven practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5 text-green-500" />
              Premium Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access high-quality feed products and supplements sourced directly from trusted suppliers. 
              Quality guaranteed for optimal results.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Farm & Ranch</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Schedule a Consultation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with Sweet Cypress Ranch experts to discuss your animals' specific needs 
                and receive personalized nutrition recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Implement Recommendations</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Follow expert guidance and source recommended premium products to begin 
                optimizing your animals' health and performance.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('AnimalNutrition')}>Start Consultation</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="https://sweetcypressranch.com" target="_blank">Visit Sweet Cypress Ranch</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
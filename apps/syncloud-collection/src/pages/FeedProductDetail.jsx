import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FeedProduct } from '@/entities/FeedProduct';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, ShoppingCart, Info, Zap } from 'lucide-react';

export default function FeedProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchProduct = async () => {
      const params = new URLSearchParams(location.search);
      const productId = params.get('id');
      
      if (productId) {
        try {
          const products = await FeedProduct.list();
          const foundProduct = products.find(p => p.id === productId);
          setProduct(foundProduct);
        } catch (error) {
          console.error("Failed to load product:", error);
        }
      }
      setLoading(false);
    };
    
    fetchProduct();
  }, [location.search]);

  const handlePurchaseContact = () => {
    if (product?.purchase_url) {
      if (product.purchase_url.startsWith('tel:')) {
        window.location.href = product.purchase_url;
      } else {
        window.open(product.purchase_url, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 md:p-6 w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <Link to={createPageUrl('FeedProducts')}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      <header className="flex items-center mb-6">
        <Link to={createPageUrl('FeedProducts')}>
          <Button variant="outline" size="icon" className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {product.name}
          </h1>
          <p className="text-muted-foreground">Sweet Cypress Ranch Feed Product</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex gap-2">
                {product.target_animal_types.map(animal => (
                  <Badge key={animal} variant="secondary">{animal}</Badge>
                ))}
              </div>
            </div>
            
            <p className="text-lg text-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            <Button 
              onClick={handlePurchaseContact}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact to Purchase
            </Button>
            
            <p className="text-sm text-muted-foreground text-center mt-2">
              Call Sweet Cypress Ranch to place your order
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Information Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Guaranteed Analysis */}
        {product.guaranteed_analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Guaranteed Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Crude Protein</span>
                <span className="font-semibold">{product.guaranteed_analysis.protein}%</span>
              </div>
              <div className="flex justify-between">
                <span>Crude Fat</span>
                <span className="font-semibold">{product.guaranteed_analysis.fat}%</span>
              </div>
              <div className="flex justify-between">
                <span>Crude Fiber</span>
                <span className="font-semibold">{product.guaranteed_analysis.fiber}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{product.ingredients}</p>
          </CardContent>
        </Card>

        {/* Feeding Instructions */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Feeding Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{product.feeding_instructions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Sweet Cypress Ranch</h3>
            <p className="text-muted-foreground mb-4">
              Quality feed and agricultural supplies for your livestock needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = 'tel:239-690-0229'} variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                (239) 690-0229 - Ft. Myers
              </Button>
              <Button onClick={() => window.location.href = 'tel:863-517-2079'} variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                (863) 517-2079 - La Belle
              </Button>
              <Button onClick={() => window.location.href = 'tel:941-505-8707'} variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                (941) 505-8707 - Punta Gorda
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
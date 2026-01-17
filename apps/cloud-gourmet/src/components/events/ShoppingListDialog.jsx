import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Download } from "lucide-react";

export default function ShoppingListDialog({ open, onOpenChange, menuRecipes, guestCount }) {
  const shoppingList = useMemo(() => {
    const items = {};
    
    menuRecipes.forEach(menuItem => {
      const recipe = menuItem.recipeDetails;
      if (!recipe?.ingredients) return;
      
      const multiplier = guestCount / (recipe.servings || 1);
      
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.item.toLowerCase();
        if (items[key]) {
          items[key].recipes.push(recipe.name);
        } else {
          items[key] = {
            item: ingredient.item,
            amount: ingredient.amount,
            multiplier: multiplier,
            recipes: [recipe.name]
          };
        }
      });
    });
    
    return Object.values(items);
  }, [menuRecipes, guestCount]);

  const downloadList = () => {
    const text = shoppingList
      .map(item => `☐ ${item.item} - ${item.amount} (for ${item.recipes.join(', ')})`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping List
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={downloadList}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <p className="text-sm text-stone-500">
            Ingredients for {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {shoppingList.length > 0 ? (
            shoppingList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-stone-200 rounded-lg hover:bg-stone-50">
                <Checkbox className="mt-1" />
                <div className="flex-1">
                  <p className="font-medium">{item.item}</p>
                  <p className="text-sm text-stone-600">{item.amount}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    For: {item.recipes.join(', ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-stone-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No ingredients in menu yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
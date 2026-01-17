import React, { useState, useEffect, useMemo } from 'react';
import { MealPlan } from '@/entities/MealPlan';
import { Recipe } from '@/entities/Recipe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, PlusCircle, Trash2, Calendar, ShoppingCart } from 'lucide-react';

const MealCard = ({ meal, recipes, onRemove }) => {
  const recipe = recipes.find(r => r.id === meal.recipe_id);
  return (
    <div className="bg-muted p-3 rounded-lg text-sm relative group">
      <h4 className="font-bold truncate">{meal.recipe_title || recipe?.title || 'Unknown Recipe'}</h4>
      <p className="text-xs text-muted-foreground capitalize">{meal.meal_type}</p>
      {recipe && (
        <p className="text-xs text-muted-foreground">{recipe.calories || 'N/A'} kcal</p>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(meal)}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
};

const AddMealDialog = ({ isOpen, onClose, recipes, onAddMeal, date, mealType }) => {
    const [selectedRecipeId, setSelectedRecipeId] = useState('');
    
    const handleAdd = () => {
        if (!selectedRecipeId) {
            toast.error("Please select a recipe.");
            return;
        }
        const recipe = recipes.find(r => r.id === selectedRecipeId);
        onAddMeal({
            date: format(date, 'yyyy-MM-dd'),
            meal_type: mealType.toLowerCase(),
            recipe_id: recipe.id,
            recipe_title: recipe.title,
            calories: recipe.nutrition_info?.calories,
            // ... other nutritional info
        });
        setSelectedRecipeId('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {mealType} for {format(date, 'MMM d')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Select onValueChange={setSelectedRecipeId} value={selectedRecipeId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a recipe..." />
                        </SelectTrigger>
                        <SelectContent>
                            {recipes.map(recipe => (
                                <SelectItem key={recipe.id} value={recipe.id}>
                                    {recipe.title} ({recipe.meal_type})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdd} className="w-full">Add Meal</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function MealPlanner() {
    const [mealPlans, setMealPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false);
    const [addMealDialogData, setAddMealDialogData] = useState({ date: new Date(), mealType: '' });

    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = addDays(start, 6);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [plans, allRecipes] = await Promise.all([
                    MealPlan.list('-start_date'),
                    Recipe.list()
                ]);

                setMealPlans(plans);
                setRecipes(allRecipes);
                if (plans.length > 0) {
                    setActivePlan(plans[0]);
                } else {
                    // If no plans, create a default one for the current week
                    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
                    const end = addDays(start, 6);
                    const newPlan = await MealPlan.create({
                        name: `Plan for ${format(start, 'MMM d')}`,
                        start_date: format(start, 'yyyy-MM-dd'),
                        end_date: format(end, 'yyyy-MM-dd'),
                        meals: [],
                    });
                    setMealPlans([newPlan]);
                    setActivePlan(newPlan);
                }
            } catch (error) {
                console.error("Failed to load meal planner data:", error);
                toast.error("Failed to load your meal plans and recipes.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handlePlanChange = (planId) => {
        const plan = mealPlans.find(p => p.id === planId);
        setActivePlan(plan);
        if (plan) {
            setCurrentDate(new Date(plan.start_date));
        }
    };
    
    const changeWeek = (direction) => {
        setCurrentDate(prev => addDays(prev, 7 * direction));
    };
    
    const openAddMealDialog = (date, mealType) => {
        setAddMealDialogData({ date, mealType });
        setIsAddMealDialogOpen(true);
    };

    const handleAddMeal = async (newMeal) => {
        if (!activePlan) return;

        const updatedMeals = [...(activePlan.meals || []), newMeal];
        try {
            const updatedPlan = await MealPlan.update(activePlan.id, { meals: updatedMeals });
            setActivePlan(updatedPlan);
            setMealPlans(plans => plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
            setIsAddMealDialogOpen(false);
            toast.success("Meal added to your plan!");
        } catch (error) {
            console.error("Failed to add meal:", error);
            toast.error("Could not add the meal.");
        }
    };

    const handleRemoveMeal = async (mealToRemove) => {
        if (!activePlan) return;

        // Note: This needs a way to uniquely identify a meal instance if multiple of the same recipe can be on the same day.
        // For now, we remove the first match. A better implementation might add a unique ID to each meal object.
        const updatedMeals = [...activePlan.meals];
        const indexToRemove = updatedMeals.findIndex(m => isSameDay(new Date(m.date), new Date(mealToRemove.date)) && m.recipe_id === mealToRemove.recipe_id && m.meal_type === mealToRemove.meal_type);
        
        if (indexToRemove > -1) {
            updatedMeals.splice(indexToRemove, 1);
            try {
                const updatedPlan = await MealPlan.update(activePlan.id, { meals: updatedMeals });
                setActivePlan(updatedPlan);
                setMealPlans(plans => plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
                toast.success("Meal removed from your plan!");
            } catch (error) {
                console.error("Failed to remove meal:", error);
                toast.error("Could not remove the meal.");
            }
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading Meal Planner...</div>;
    }

    return (
        <div className="p-4 md:p-6 w-full">
            <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Meal Planner</h1>
                        <p className="text-muted-foreground">Plan your weekly meals with ease.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select onValueChange={handlePlanChange} value={activePlan?.id || ''}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select a meal plan..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mealPlans.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button><PlusCircle className="w-4 h-4 mr-2" /> New Plan</Button>
                </div>
            </header>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => changeWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
                        <h3 className="text-lg font-semibold text-center min-w-[200px]">
                            {`${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
                        </h3>
                        <Button variant="outline" size="icon" onClick={() => changeWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                    <Button variant="outline"><ShoppingCart className="w-4 h-4 mr-2"/> Generate Shopping List</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                        {weekDays.map(day => (
                            <div key={day.toString()} className="border rounded-lg bg-background">
                                <div className="p-3 border-b text-center font-bold">
                                    <p>{format(day, 'EEE')}</p>
                                    <p className="text-lg">{format(day, 'd')}</p>
                                </div>
                                <div className="p-2 space-y-2">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => (
                                        <div key={mealType}>
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-1 px-1">{mealType}</h4>
                                            <div className="space-y-1 min-h-[50px]">
                                                {activePlan?.meals?.filter(m => isSameDay(new Date(m.date), day) && m.meal_type === mealType.toLowerCase()).map((meal, index) => (
                                                    <MealCard key={index} meal={meal} recipes={recipes} onRemove={handleRemoveMeal} />
                                                ))}
                                            </div>
                                            <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => openAddMealDialog(day, mealType)}>
                                                <PlusCircle className="w-3 h-3 mr-1" /> Add
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <AddMealDialog 
                isOpen={isAddMealDialogOpen}
                onClose={() => setIsAddMealDialogOpen(false)}
                recipes={recipes}
                onAddMeal={handleAddMeal}
                date={addMealDialogData.date}
                mealType={addMealDialogData.mealType}
            />
        </div>
    );
}
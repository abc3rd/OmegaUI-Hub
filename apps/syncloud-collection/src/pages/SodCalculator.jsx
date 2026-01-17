import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check } from 'lucide-react';

export default function SodCalculator() {
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [palletSize, setPalletSize] = useState(450); // Default sq ft per pallet
    const [result, setResult] = useState(null);

    const calculateSod = () => {
        const area = parseFloat(length) * parseFloat(width);
        if (isNaN(area) || area <= 0) {
            setResult(null);
            return;
        }
        const palletsNeeded = Math.ceil(area / palletSize);
        setResult({
            area: area.toFixed(2),
            pallets: palletsNeeded
        });
    };

    return (
        <div className="p-6 flex justify-center items-start pt-16">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-primary" />
                        Sod Pallet Calculator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="length">Length (feet)</Label>
                            <Input id="length" type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g., 50" />
                        </div>
                        <div>
                            <Label htmlFor="width">Width (feet)</Label>
                            <Input id="width" type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="e.g., 30" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="palletSize">Sq. Ft. per Pallet</Label>
                        <Input id="palletSize" type="number" value={palletSize} onChange={e => setPalletSize(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={calculateSod}>Calculate</Button>
                    {result && (
                        <Card className="bg-muted p-6">
                            <CardTitle className="text-center mb-4">Results</CardTitle>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Total Area:</span>
                                    <span className="font-bold">{result.area} sq. ft.</span>
                                </div>
                                <div className="flex justify-between items-center text-lg text-primary">
                                    <span className="font-semibold">Pallets Needed:</span>
                                    <span className="font-bold text-2xl flex items-center gap-2">
                                        <Check className="w-6 h-6"/>
                                        {result.pallets}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
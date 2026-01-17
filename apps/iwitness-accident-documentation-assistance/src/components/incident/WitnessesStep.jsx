import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Plus, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emptyWitness = {
  name: '',
  phone: '',
  email: '',
  statement: ''
};

export default function WitnessesStep({ data, onChange }) {
  const witnesses = data.witnesses || [];

  const addWitness = () => {
    onChange({ ...data, witnesses: [...witnesses, { ...emptyWitness }] });
  };

  const removeWitness = (index) => {
    onChange({ ...data, witnesses: witnesses.filter((_, i) => i !== index) });
  };

  const updateWitness = (index, field, value) => {
    const newWitnesses = [...witnesses];
    newWitnesses[index] = { ...newWitnesses[index], [field]: value };
    onChange({ ...data, witnesses: newWitnesses });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-50">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Witnesses</h2>
            <p className="text-sm text-slate-500">Add anyone who witnessed the incident</p>
          </div>
        </div>
        <Button onClick={addWitness} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Witness
        </Button>
      </div>

      {witnesses.length === 0 && (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-slate-100 mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-700 mb-2">No witnesses added</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
              If anyone saw what happened, their information can be valuable for your documentation.
            </p>
            <Button onClick={addWitness} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Witness
            </Button>
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {witnesses.map((witness, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <CardTitle className="text-base">
                      {witness.name || `Witness ${index + 1}`}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWitness(index)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Full name"
                      value={witness.name}
                      onChange={(e) => updateWitness(index, 'name', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input
                      placeholder="Phone number"
                      type="tel"
                      value={witness.phone}
                      onChange={(e) => updateWitness(index, 'phone', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (optional)</Label>
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={witness.email}
                      onChange={(e) => updateWitness(index, 'email', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Statement (optional)</Label>
                  <Textarea
                    placeholder="What did they say they saw?"
                    value={witness.statement}
                    onChange={(e) => updateWitness(index, 'statement', e.target.value)}
                    className="bg-white resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="pt-4">
          <CardDescription className="text-sm">
            <strong>Tip:</strong> Even if you don't have complete contact information, 
            noting that there were witnesses and any details you remember about them can be helpful.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
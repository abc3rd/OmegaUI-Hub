import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeviceForm from "../components/devices/DeviceForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setIsLoading(true);
    const data = await base44.entities.Device.list("-created_date");
    setDevices(data);
    setIsLoading(false);
  };

  const handleFormSubmit = async () => {
    setIsFormOpen(false);
    setEditingDevice(null);
    await loadDevices();
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setIsFormOpen(true);
  };

  const handleDelete = async (deviceId) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      await base44.entities.Device.delete(deviceId);
      await loadDevices();
    }
  };
  
  const toggleActive = async (device) => {
    await base44.entities.Device.update(device.id, { is_active: !device.is_active });
    await loadDevices();
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
          <Zap className="w-6 h-6 text-green-300" />
          <h1 className="text-3xl font-bold text-white">Manage Devices</h1>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDevice(null)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{editingDevice ? "Edit Device" : "Add New Device"}</DialogTitle>
            </DialogHeader>
            <DeviceForm device={editingDevice} onSubmitSuccess={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b-white/20 hover:bg-transparent">
              <TableHead className="text-white/80">Name</TableHead>
              <TableHead className="text-white/80">Type</TableHead>
              <TableHead className="text-white/80">Location</TableHead>
              <TableHead className="text-white/80">Power (W)</TableHead>
              <TableHead className="text-white/80">Active</TableHead>
              <TableHead className="text-white/80 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array(5).fill(0).map((_, i) => (
                <TableRow key={i} className="border-none">
                    <TableCell><Skeleton className="h-4 w-24 bg-white/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 bg-white/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 bg-white/20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 bg-white/20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 bg-white/20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 bg-white/20 ml-auto" /></TableCell>
                </TableRow>
            )) : devices.map((device) => (
              <TableRow key={device.id} className="border-b-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">{device.name}</TableCell>
                <TableCell className="text-white/80 capitalize">{device.type}</TableCell>
                <TableCell className="text-white/80">{device.location}</TableCell>
                <TableCell className="text-white/80">{device.power_rating_watts}</TableCell>
                <TableCell>
                  <Switch checked={device.is_active} onCheckedChange={() => toggleActive(device)} />
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(device)}>
                            <Edit className="w-4 h-4 text-blue-300" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(device.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
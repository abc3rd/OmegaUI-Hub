import React, { useState, useEffect } from "react";
import { Database as DatabaseEntity } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Server, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

const DATABASE_TYPES = [
  { value: "internal", label: "Internal (Base44)", icon: Database },
  { value: "postgresql", label: "PostgreSQL", icon: Server },
  { value: "mysql", label: "MySQL", icon: Server },
  { value: "mongodb", label: "MongoDB", icon: Server },
  { value: "sqlite", label: "SQLite", icon: Database },
  { value: "mssql", label: "Microsoft SQL Server", icon: Server }
];

const DEFAULT_PORTS = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  mssql: 1433
};

export default function DatabaseConnectionDialog({ open, onOpenChange, database, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "internal",
    connection_config: {
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
      ssl: false,
      connection_string: ""
    }
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionMode, setConnectionMode] = useState("form"); // 'form' or 'string'

  useEffect(() => {
    if (database) {
      setForm({
        name: database.name || "",
        description: database.description || "",
        type: database.type || "internal",
        connection_config: database.connection_config || {
          host: "",
          port: "",
          database: "",
          username: "",
          password: "",
          ssl: false,
          connection_string: ""
        }
      });
    } else {
      setForm({
        name: "",
        description: "",
        type: "internal",
        connection_config: {
          host: "",
          port: "",
          database: "",
          username: "",
          password: "",
          ssl: false,
          connection_string: ""
        }
      });
    }
    setTestResult(null);
  }, [database, open]);

  useEffect(() => {
    // Auto-set default port when database type changes
    if (form.type !== "internal" && !form.connection_config.port) {
      setForm(f => ({
        ...f,
        connection_config: {
          ...f.connection_config,
          port: DEFAULT_PORTS[f.type] || ""
        }
      }));
    }
  }, [form.type]);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Mock connection test - in real app, this would call backend API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure based on whether required fields are filled
      const isValid = connectionMode === "string"
        ? form.connection_config.connection_string.trim().length > 0
        : form.connection_config.host && form.connection_config.database;

      if (isValid && Math.random() > 0.3) {
        setTestResult({
          success: true,
          message: "Connection successful! Database is reachable.",
          details: {
            version: "PostgreSQL 14.5",
            tables: 12,
            size: "45.3 MB"
          }
        });
      } else {
        setTestResult({
          success: false,
          message: "Connection failed",
          error: "Could not connect to database. Please check your credentials and network settings."
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection test failed",
        error: error.message
      });
    }

    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        type: form.type,
        connection_config: form.type === "internal" ? null : form.connection_config,
        status: form.type === "internal" ? "active" : "testing"
      };

      if (database) {
        await DatabaseEntity.update(database.id, data);
      } else {
        await DatabaseEntity.create(data);
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving database:", error);
    }
    setSaving(false);
  };

  const buildConnectionString = () => {
    const { host, port, database: db, username, password, ssl } = form.connection_config;
    
    switch (form.type) {
      case "postgresql":
        return `postgresql://${username}:${password}@${host}:${port}/${db}${ssl ? '?sslmode=require' : ''}`;
      case "mysql":
        return `mysql://${username}:${password}@${host}:${port}/${db}${ssl ? '?ssl=true' : ''}`;
      case "mongodb":
        return `mongodb://${username}:${password}@${host}:${port}/${db}${ssl ? '?ssl=true' : ''}`;
      case "mssql":
        return `mssql://${username}:${password}@${host}:${port}/${db}${ssl ? ';encrypt=true' : ''}`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {database ? "Edit Database Connection" : "Connect to Database"}
          </DialogTitle>
          <DialogDescription>
            Connect to an external database or create an internal one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label>Database Name</Label>
              <Input
                placeholder="My Database"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Input
                placeholder="Production customer database"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <Label>Database Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATABASE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* External Connection Configuration */}
          {form.type !== "internal" && (
            <>
              <Tabs value={connectionMode} onValueChange={setConnectionMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Connection Form</TabsTrigger>
                  <TabsTrigger value="string">Connection String</TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Host</Label>
                      <Input
                        placeholder="localhost or db.example.com"
                        value={form.connection_config.host}
                        onChange={(e) => setForm({
                          ...form,
                          connection_config: { ...form.connection_config, host: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <Label>Port</Label>
                      <Input
                        type="number"
                        placeholder={DEFAULT_PORTS[form.type]?.toString() || ""}
                        value={form.connection_config.port}
                        onChange={(e) => setForm({
                          ...form,
                          connection_config: { ...form.connection_config, port: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Database Name</Label>
                    <Input
                      placeholder="my_database"
                      value={form.connection_config.database}
                      onChange={(e) => setForm({
                        ...form,
                        connection_config: { ...form.connection_config, database: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Username</Label>
                      <Input
                        placeholder="db_user"
                        value={form.connection_config.username}
                        onChange={(e) => setForm({
                          ...form,
                          connection_config: { ...form.connection_config, username: e.target.value }
                        })}
                      />
                    </div>

                    <div>
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={form.connection_config.password}
                          onChange={(e) => setForm({
                            ...form,
                            connection_config: { ...form.connection_config, password: e.target.value }
                          })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.connection_config.ssl}
                      onCheckedChange={(v) => setForm({
                        ...form,
                        connection_config: { ...form.connection_config, ssl: v }
                      })}
                    />
                    <Label>Use SSL/TLS</Label>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Connection string: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                        {buildConnectionString()}
                      </code>
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="string" className="space-y-4 mt-4">
                  <div>
                    <Label>Connection String</Label>
                    <Input
                      placeholder="postgresql://user:password@host:port/database"
                      value={form.connection_config.connection_string}
                      onChange={(e) => setForm({
                        ...form,
                        connection_config: { ...form.connection_config, connection_string: e.target.value }
                      })}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the full connection string for your database
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <div className="font-semibold mb-1">Example formats:</div>
                      <div className="space-y-1 font-mono text-[10px]">
                        <div>PostgreSQL: postgresql://user:pass@host:5432/db</div>
                        <div>MySQL: mysql://user:pass@host:3306/db</div>
                        <div>MongoDB: mongodb://user:pass@host:27017/db</div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>

              {/* Test Connection */}
              <div className="space-y-3">
                <Button
                  onClick={testConnection}
                  disabled={testing}
                  variant="outline"
                  className="w-full"
                >
                  {testing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing Connection...</>
                  ) : (
                    <><Server className="w-4 h-4 mr-2" /> Test Connection</>
                  )}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="font-semibold">{testResult.message}</div>
                      {testResult.error && (
                        <div className="text-xs mt-1">{testResult.error}</div>
                      )}
                      {testResult.details && (
                        <div className="text-xs mt-2 space-y-1">
                          <div>Version: {testResult.details.version}</div>
                          <div>Tables: {testResult.details.tables}</div>
                          <div>Size: {testResult.details.size}</div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              database ? "Update Connection" : "Create Connection"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
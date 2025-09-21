import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield, Database, Mail, Globe, Key } from 'lucide-react';
import { getAIProviderKeys, upsertAIProviderKeys, getPlatformSettings, upsertPlatformSettings } from '@/lib/supabaseQueries';
import { toast } from 'sonner';

export function SettingsPanel() {
  const [googleKey, setGoogleKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [platformName, setPlatformName] = useState('AspireExamine');
  const [adminEmail, setAdminEmail] = useState('admin@aspireexamine.com');
  const [platformDescription, setPlatformDescription] = useState('Professional exam preparation platform');
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [preventCopy, setPreventCopy] = useState(true);
  const [showResults, setShowResults] = useState(true);
  const [warningMinutes, setWarningMinutes] = useState(5);
  const [criticalMinutes, setCriticalMinutes] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const keys = await getAIProviderKeys();
        setGoogleKey(keys.google_gemini_key || '');
        setOpenrouterKey(keys.openrouter_key || '');
        setGroqKey(keys.groq_key || '');
      } catch (e: any) {
        // no-op: table might not exist yet
      }
      try {
        const s = await getPlatformSettings();
        if (s.platform_name) setPlatformName(s.platform_name);
        if (s.admin_email) setAdminEmail(s.admin_email);
        if (s.platform_description) setPlatformDescription(s.platform_description);
        if (s.exam_auto_submit !== null) setAutoSubmit(!!s.exam_auto_submit);
        if (s.exam_prevent_copy !== null) setPreventCopy(!!s.exam_prevent_copy);
        if (s.exam_show_immediate_results !== null) setShowResults(!!s.exam_show_immediate_results);
        if (s.exam_warning_minutes !== null) setWarningMinutes(Number(s.exam_warning_minutes));
        if (s.exam_critical_minutes !== null) setCriticalMinutes(Number(s.exam_critical_minutes));
      } catch (e: any) {}
    })();
  }, []);

  const handleSaveAIKeys = async () => {
    try {
      await upsertAIProviderKeys({
        google_gemini_key: googleKey || null,
        openrouter_key: openrouterKey || null,
        groq_key: groqKey || null,
      });
      toast.success('AI provider keys saved');
    } catch (e: any) {
      toast.error(`Failed to save keys: ${e.message || String(e)}`);
    }
  };

  const handleSavePlatformSettings = async () => {
    try {
      await upsertPlatformSettings({
        platform_name: platformName,
        admin_email: adminEmail,
        platform_description: platformDescription,
        exam_auto_submit: autoSubmit,
        exam_prevent_copy: preventCopy,
        exam_show_immediate_results: showResults,
        exam_warning_minutes: warningMinutes,
        exam_critical_minutes: criticalMinutes,
      });
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(`Failed to save settings: ${e.message || String(e)}`);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Platform Settings</h2>
        <p className="text-sm text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-xl">General Settings</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" value={platformName} onChange={e => setPlatformName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="platform-description">Platform Description</Label>
              <Input id="platform-description" value={platformDescription} onChange={e => setPlatformDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Exam Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-xl">Exam Settings</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure exam behavior and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-submit">Auto-submit on time expiry</Label>
                <p className="text-sm text-muted-foreground">Automatically submit exam when time runs out</p>
              </div>
              <Switch id="auto-submit" checked={autoSubmit} onCheckedChange={setAutoSubmit} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="prevent-copy">Prevent copy/paste</Label>
                <p className="text-sm text-muted-foreground">Disable copy and paste during exams</p>
              </div>
              <Switch id="prevent-copy" checked={preventCopy} onCheckedChange={setPreventCopy} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-results">Show immediate results</Label>
                <p className="text-sm text-muted-foreground">Display results immediately after submission</p>
              </div>
              <Switch id="show-results" checked={showResults} onCheckedChange={setShowResults} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warning-time">Warning time (minutes)</Label>
                <Input id="warning-time" type="number" value={warningMinutes} onChange={e => setWarningMinutes(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="critical-time">Critical time (minutes)</Label>
                <Input id="critical-time" type="number" value={criticalMinutes} onChange={e => setCriticalMinutes(Number(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 sm:h-5 sm_w-5" />
              <span className="text-base sm:text-xl">Notification Settings</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure email and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email notifications to users</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="result-emails">Result Notifications</Label>
                <p className="text-sm text-muted-foreground">Email results to students after exam completion</p>
              </div>
              <Switch id="result-emails" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="admin-alerts">Admin Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify admins of important events</p>
              </div>
              <Switch id="admin-alerts" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 sm:h-5 sm_w-5" />
              <span className="text-base sm:text-xl">System Settings</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Database and performance configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <select className="w-full p-2 border rounded">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                <Input id="session-timeout" type="number" defaultValue="24" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable during system updates</p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
          </CardContent>
        </Card>

        {/* AI Provider API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4 sm:h-5 sm_w-5" />
              <span className="text-base sm:text-xl">AI Provider API Keys</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure keys for Gemini, OpenRouter, and Groq (stored in Supabase)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="google-gemini-key">Google Gemini API Key</Label>
                <Input id="google-gemini-key" type="password" placeholder="GEMINI_API_KEY" value={googleKey} onChange={e => setGoogleKey(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <Input id="openrouter-key" type="password" placeholder="sk-or-..." value={openrouterKey} onChange={e => setOpenrouterKey(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="groq-key">Groq API Key</Label>
              <Input id="groq-key" type="password" placeholder="gsk_..." value={groqKey} onChange={e => setGroqKey(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveAIKeys}>Save API Keys</Button>
                <Button onClick={handleSavePlatformSettings}>Save Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes */}
        <div className="flex justify-end">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Settings className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
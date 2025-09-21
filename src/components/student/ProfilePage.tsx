import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Result, Paper } from '@/types';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import { FileText, Clock, User as UserIcon, Mail, Phone, Calendar, Home, Image as ImageIcon } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader } from '@/components/shared/Loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  user: User;
  recentTests: Result[];
  allPapers: Paper[];
  onProfileUpdate: () => void;
}

interface EditProfileFormProps {
  profile: User;
  onSave: (updatedProfile: Partial<User>, profilePictureFile: File | null) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [fullName, setFullName] = useState(profile.name);
  const [contactNumber, setContactNumber] = useState(profile.contact_number || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth || '');
  const [address, setAddress] = useState(profile.address || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(profile.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setProfilePictureUrl(URL.createObjectURL(file)); // Display selected image immediately
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<User> = {
      name: fullName,
      contact_number: contactNumber,
      date_of_birth: dateOfBirth,
      address: address,
    };
    onSave(updatedProfile, profilePicture);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-24 w-24 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-primary/20 cursor-pointer"
              style={{ backgroundImage: `url(${profilePictureUrl || 'https://placehold.co/96x96/6366f1/ffffff?text=User'})` }}
              onClick={() => fileInputRef.current?.click()}
            />
            <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" /> Change Profile Picture
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g., +1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your Address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export function ProfilePage({ user, recentTests, allPapers, onProfileUpdate }: ProfilePageProps) {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSaveProfile = async (updatedProfile: Partial<User>, profilePictureFile: File | null) => {
    setLoading(true);
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !authUser) {
      console.error('Error getting user for profile update:', userError);
      toast({
        title: 'Error',
        description: 'Failed to retrieve user information for update.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    let avatarUrl = user?.avatar; // Use current profile avatar as default

    if (profilePictureFile) {
      const fileExt = profilePictureFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${authUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, profilePictureFile, {
          cacheControl: '3600',
          upsert: true, // Use upsert to allow overwriting
        });

      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        toast({
          title: 'Error uploading profile picture',
          description: uploadError.message || 'An unknown error occurred during upload.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        avatarUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updatedProfile.name,
        contact_number: updatedProfile.contact_number,
        date_of_birth: updatedProfile.date_of_birth,
        address: updatedProfile.address,
        profile_picture: avatarUrl,
      })
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'An unknown error occurred during profile update.',
        variant: 'destructive',
      });
    } else {
      console.log('Updated profile data:', data);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
      setIsEditing(false);
      onProfileUpdate(); // Re-fetch in App.tsx to display updated data globally
    }
    setLoading(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <div className="text-center py-8">No profile data found. Please log in.</div>;
  }

  

  return (
    <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mx-auto">
      {isEditing ? (
        <EditProfileForm profile={user} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-full bg-cover bg-center bg-no-repeat ring-4 ring-primary/20"
                  style={{ backgroundImage: `url(${user.avatar || 'https://placehold.co/128x128/6366f1/ffffff?text=User'})` }}
                />
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold">{user.name}</h2>
                  <p className="text-xs text-muted-foreground">Student ID: {user.id}</p>
                  <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <div className="mb-6">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/50 p-1 sm:h-10 sm:grid-cols-4 sm:bg-transparent sm:p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-border">
                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><UserIcon className="h-4 w-4" />Full Name</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{user.name}</dd>
                    </div>
                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Email address</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{user.email}</dd>
                    </div>
                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" />Contact Number</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{user.contact_number || 'N/A'}</dd>
                    </div>
                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />Date of Birth</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{user.date_of_birth || 'N/A'}</dd>
                    </div>
                    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                      <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Home className="h-4 w-4" />Address</dt>
                      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{user.address || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5"/>
                    Recent Test Activity
                  </CardTitle>
                  <CardDescription>Your five most recent tests.</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {recentTests.slice(0, 5).map((test, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{allPapers.find(p => p.id === test.paperId)?.title || 'Unknown Test'}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(test.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold">{test.score}/{test.totalMarks}</span>
                            <Badge variant="outline" className="font-semibold text-xs">
                              {Math.round(test.percentage)}%
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Academic Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="mb-1 flex justify-between">
                            <p className="text-sm font-medium">Overall Completion</p>
                            <p className="text-sm font-medium text-primary">75%</p>
                        </div>
                        <Progress value={75} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border bg-background p-3">
                            <p className="text-sm font-medium text-muted-foreground">Exams Completed</p>
                            <p className="text-xl sm:text-3xl font-bold">12</p>
                        </div>
                        <div className="rounded-lg border bg-background p-3">
                            <p className="text-sm font-medium text-muted-foreground">Practice Tests Taken</p>
                            <p className="text-xl sm:text-3xl font-bold">25</p>
                        </div>
                        <div className="rounded-lg border bg-background p-3">
                            <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                            <p className="text-xl sm:text-3xl font-bold">85%</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            
            <TabsContent value="progress">
                <Card><CardHeader><CardTitle>Progress</CardTitle></CardHeader><CardContent><p>Progress details coming soon.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="settings">
                <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent><p>Settings panel coming soon.</p></CardContent></Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
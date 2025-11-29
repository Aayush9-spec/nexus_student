'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil } from 'lucide-react';
import type { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Camera } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  college: z.string().optional(),
  major: z.string().optional(),
  studentId: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  socialLinks: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
  }).optional(),
});

export function EditProfileDialog({ user }: { user: User }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      college: user.college || '',
      major: user.major || '',
      studentId: user.studentId || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      skills: user.skills || [],
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
        website: user.socialLinks?.website || '',
      },
    },
  });

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues('skills') || [];
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue('skills', [...currentSkills, skillInput.trim()]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('skills') || [];
    form.setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(firestore, 'users', user.id);
      let updatedValues: any = { ...values };

      if (newProfilePic) {
        const storage = getStorage();
        const storageRef = ref(storage, `users/${user.id}/profile_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, newProfilePic);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        updatedValues.profilePictureUrl = downloadUrl;
      }

      await updateDoc(userRef, updatedValues);
      toast({ title: 'Profile updated successfully!' });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('profile-pic-upload')?.click()}>
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={previewUrl || user.profilePictureUrl} className="object-cover" />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                id="profile-pic-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('profile-pic-upload')?.click()}>
                Change Photo
              </Button>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="college"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>College / University</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Stanford University" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="major"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Major / Course</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID / Roll No</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. +1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a little about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="e.g., Python"
                    />
                    <Button type="button" onClick={handleAddSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map(skill => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="socialLinks.linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="socialLinks.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl><Input placeholder="https://yourwebsite.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

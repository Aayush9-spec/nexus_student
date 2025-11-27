"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateDefaultProfilePicture } from "@/ai/flows/generate-default-profile-picture";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/Logo";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  college: z.string().min(3, { message: "College name is required." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  profilePictureUrl: z.string().optional(),
});

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      college: "",
      password: "",
      profilePictureUrl: "",
    },
  });

  const handleGenerateImage = async () => {
    const name = form.getValues("name");
    if (!name) {
      form.setError("name", { message: "Please enter your name first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateDefaultProfilePicture({ studentName: name });
      if (result.profilePictureDataUri) {
        setPreviewImage(result.profilePictureDataUri);
        form.setValue("profilePictureUrl", result.profilePictureDataUri);
        toast({ title: "Profile picture generated!", description: "Looking good!" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Generation Failed", description: "Could not generate image. This may be due to API limitations." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreviewImage(dataUri);
        form.setValue("profilePictureUrl", dataUri);
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      let finalProfilePicUrl = values.profilePictureUrl;
      if (!finalProfilePicUrl) {
        toast({ title: "Setting a default profile picture..." });
        finalProfilePicUrl = "https://picsum.photos/seed/defaultuser/200";
      }

      await signup(values.name, values.email, values.password, values.college, finalProfilePicUrl);
      toast({ title: "Welcome!", description: "Your account has been created." });
      router.push("/marketplace");
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please log in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <Logo className="justify-center mb-2" />
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join the Nexus community and start exploring.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem className="flex flex-col items-center">
              <FormLabel>Profile Picture</FormLabel>
              <Avatar className="h-24 w-24 my-2">
                <AvatarImage src={previewImage || undefined} />
                <AvatarFallback>
                  <Loader2 className={`animate-spin ${isGenerating ? 'block' : 'hidden'}`} />
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="button" size="sm" onClick={handleGenerateImage} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate with AI
                </Button>
              </div>
            </FormItem>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="priya.sharma@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="college" render={({ field }) => (
              <FormItem><FormLabel>College/University</FormLabel><FormControl><Input placeholder="IIT Bombay" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

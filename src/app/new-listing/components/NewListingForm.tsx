
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { categorizeListing } from "@/ai/flows/categorize-listing";
import { listingCategories } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Upload } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  category: z.enum(listingCategories, { required_error: "Please select a category." }),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  media: z.instanceof(File).refine(file => file.size > 0, "Image or video is required."),
});

export function NewListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  const [preview, setPreview] = React.useState<{url: string; type: 'image' | 'video'} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
    },
  });
  
  React.useEffect(() => {
    if (!user) {
        toast({
            title: "Please log in",
            description: "You must be logged in to create a listing.",
            variant: "destructive"
        });
        router.push('/login');
    }
  }, [user, router, toast]);

  const handleCategorize = async () => {
    const title = form.getValues("title");
    const description = form.getValues("description");
    if (!title || !description) {
      toast({ title: "Please fill in title and description first.", variant: "destructive" });
      return;
    }
    setIsCategorizing(true);
    try {
      const result = await categorizeListing({ title, description });
      if (result.category) {
        form.setValue("category", result.category);
        toast({ title: "Category suggested!", description: `We think this is a '${result.category}'.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Categorization Failed", description: "Could not suggest a category." });
    } finally {
      setIsCategorizing(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const url = reader.result as string;
          const type = file.type.startsWith('video') ? 'video' : 'image';
          setPreview({ url, type });
      };
      reader.readAsDataURL(file);
      form.setValue('media', file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ title: "Error", description: "You must be logged in to create a listing.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload media to Firebase Storage
      const storage = getStorage();
      const mediaFile = values.media;
      const mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      const storageRef = ref(storage, `listings/${user.id}/${Date.now()}_${mediaFile.name}`);
      const uploadResult = await uploadBytes(storageRef, mediaFile);
      const mediaUrl = await getDownloadURL(uploadResult.ref);

      // 2. Create new listing document in Firestore
      await addDoc(collection(firestore, "listings"), {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        sellerId: user.id,
        college: user.college, // Assuming user object has college info
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Listing Created!",
        description: "Your listing is now live on the marketplace.",
      });
      router.push("/marketplace");

    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not create listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form. handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Listing Title</FormLabel><FormControl><Input placeholder="e.g., Used Engineering Mechanics Textbook" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product or service in detail..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <FormLabel>Category</FormLabel>
                    <Button type="button" size="sm" variant="ghost" onClick={handleCategorize} disabled={isCategorizing}>
                        {isCategorizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        Suggest with AI
                    </Button>
                </div>
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {listingCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                   </FormItem>
                )} />
            </div>

            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Price</FormLabel><FormControl><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">₹</span><Input type="number" step="10" placeholder="500" className="pl-6" {...field} /></div></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="media" render={({ field }) => (
                <FormItem>
                    <FormLabel>Image or Video</FormLabel>
                     <FormControl>
                        <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('media-upload')?.click()}>
                                <Upload className="mr-2 h-4 w-4"/> Upload Media
                            </Button>
                            <input type="file" id="media-upload" className="hidden" accept="image/*,video/*" onChange={(e) => {
                                handleFileChange(e);
                                field.onChange(e.target.files?.[0]);
                            }} />
                        </div>
                    </FormControl>
                    {preview && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden mt-2">
                            {preview.type === 'image' ? (
                                <Image src={preview.url} alt="Preview" fill className="object-cover" />
                            ) : (
                                <video src={preview.url} controls className="w-full h-full object-cover" />
                            )}
                        </div>
                    )}
                    <FormMessage />
                </FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    
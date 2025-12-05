
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { categorizeListing } from "@/ai/flows/categorize-listing";
import { listingCategories, ListingSeller, LocationDetails } from "@/lib/types";
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
import { LocationSearchInput } from "@/app/marketplace/components/LocationSearchInput";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  category: z.enum(listingCategories as [string, ...string[]], { required_error: "Please select a category." }),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  media: z.array(z.instanceof(File)).min(1, "At least one image or video is required."),
  location: z.custom<LocationDetails | null>(data => data !== undefined, "Location is required."),
});

export function NewListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  const [previews, setPreviews] = React.useState<{ url: string; type: 'image' | 'video' }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: null,
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const newPreviews: { url: string; type: 'image' | 'video' }[] = [];
      const fileArray = Array.from(files);

      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          const type = file.type.startsWith('video') ? 'video' : 'image';
          newPreviews.push({ url, type });
          if (newPreviews.length === fileArray.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      const currentMedia = form.getValues('media') || [];
      form.setValue('media', [...currentMedia, ...fileArray]);
    }
  };

  const removeMedia = (index: number) => {
    const currentMedia = form.getValues('media');
    const newMedia = currentMedia.filter((_: any, i: number) => i !== index);
    form.setValue('media', newMedia);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !values.location) {
      toast({ title: "Error", description: "You must be logged in and provide a location to create a listing.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload media to Firebase Storage
      const storage = getStorage();
      const mediaFiles = values.media;
      const uploadPromises = mediaFiles.map(async (file) => {
        const storageRef = ref(storage, `listings/${user.id}/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        return getDownloadURL(uploadResult.ref);
      });

      const mediaUrls = await Promise.all(uploadPromises);
      const mediaUrl = mediaUrls[0]; // Main image
      const mediaType = mediaFiles[0].type.startsWith('video') ? 'video' : 'image';

      // 2. Prepare denormalized seller data
      const sellerData: ListingSeller = {
        id: user.id,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl
      }

      // 3. Create new listing document in Firestore
      await addDoc(collection(firestore, "listings"), {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price,
        mediaUrl: mediaUrl,
        images: mediaUrls,
        mediaType: mediaType,
        sellerId: user.id,
        seller: sellerData, // Add the denormalized seller data
        college: user.college,
        createdAt: serverTimestamp(),
        status: 'active',
        location: values.location,
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Listing Title</FormLabel><FormControl><Input placeholder="e.g., Used Engineering Mechanics Textbook" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your product or service in detail..." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Controller
              control={form.control}
              name="location"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <LocationSearchInput onLocationSelect={(loc) => field.onChange(loc)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Category</FormLabel>
                <Button type="button" size="sm" variant="ghost" onClick={handleCategorize} disabled={isCategorizing}>
                  {isCategorizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
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
              <FormItem><FormLabel>Price</FormLabel><FormControl><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground font-sans">₹</span><Input type="number" step="10" placeholder="500" className="pl-6" {...field} /></div></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="media" render={({ field }) => (
              <FormItem>
                <FormLabel>Images or Video</FormLabel>
                <FormControl>
                  <div>
                    <Button type="button" variant="outline" onClick={() => document.getElementById('media-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Media
                    </Button>
                    <input type="file" id="media-upload" className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
                  </div>
                </FormControl>
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden bg-muted group">
                        {preview.type === 'image' ? (
                          <Image src={preview.url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                        ) : (
                          <video src={preview.url} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                      </div>
                    ))}
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

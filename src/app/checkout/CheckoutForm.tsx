"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, CreditCard, Banknote, Smartphone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Order } from "@/lib/types";

const baseSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    address: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }),
    city: z.string().min(2, {
        message: "City must be at least 2 characters.",
    }),
    zip: z.string().min(5, {
        message: "Zip code must be at least 5 characters.",
    }),
    paymentMethod: z.enum(["credit_card", "upi", "cod"], {
        required_error: "Please select a payment method.",
    }),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvc: z.string().optional(),
    upiId: z.string().optional(),
});

const formSchema = baseSchema.superRefine((data, ctx) => {
    if (data.paymentMethod === "credit_card") {
        if (!data.cardNumber || data.cardNumber.length < 16) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Card number must be 16 digits.",
                path: ["cardNumber"],
            });
        }
        if (!data.expiry || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.expiry)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expiry must be in MM/YY format.",
                path: ["expiry"],
            });
        }
        if (!data.cvc || data.cvc.length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "CVC must be 3 or 4 digits.",
                path: ["cvc"],
            });
        }
    }
    if (data.paymentMethod === "upi") {
        if (!data.upiId || !data.upiId.includes("@")) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a valid UPI ID (e.g., user@upi).",
                path: ["upiId"],
            });
        }
    }
});

export function CheckoutForm() {
    const { items, total, clearCart } = useCart();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const firestore = useFirestore();
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            address: "",
            city: "",
            zip: "",
            paymentMethod: "credit_card",
            cardNumber: "",
            expiry: "",
            cvc: "",
            upiId: "",
        },
    });

    const paymentMethod = form.watch("paymentMethod");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication required",
                description: "Please login to place an order.",
            });
            router.push("/login");
            return;
        }

        if (!firestore) {
            toast({
                variant: "destructive",
                title: "System Error",
                description: "Database connection failed. Please try again later.",
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderData: Omit<Order, "id"> = {
                buyerId: user.id,
                items: items.map(item => ({
                    listingId: item.id,
                    sellerId: item.sellerId,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: total,
                paymentMethod: values.paymentMethod,
                status: 'pending',
                shippingAddress: {
                    name: values.name,
                    email: values.email,
                    address: values.address,
                    city: values.city,
                    zip: values.zip,
                },
                createdAt: new Date().toISOString(),
            };

            await addDoc(collection(firestore, "orders"), {
                ...orderData,
                timestamp: serverTimestamp()
            });

            clearCart();
            toast({
                title: "Order placed successfully!",
                description: `Your order has been placed using ${values.paymentMethod === 'cod' ? 'Cash on Delivery' : values.paymentMethod === 'upi' ? 'UPI' : 'Credit Card'}.`,
            });
            router.push("/");

        } catch (error) {
            console.error("Order placement failed:", error);
            toast({
                variant: "destructive",
                title: "Order Failed",
                description: "There was an error processing your order. Please try again.",
            });
        } finally {
            setIsProcessing(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Button onClick={() => router.push("/marketplace")}>Browse Marketplace</Button>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="New York" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zip"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Zip Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="10001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator className="my-4" />

                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Payment Method</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                >
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="credit_card" id="credit_card" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="credit_card"
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                            <CreditCard className="mb-3 h-6 w-6" />
                                                            Card
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="upi"
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                            <Smartphone className="mb-3 h-6 w-6" />
                                                            UPI
                                                        </Label>
                                                    </FormItem>
                                                    <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor="cod"
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                            <Banknote className="mb-3 h-6 w-6" />
                                                            Cash
                                                        </Label>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {paymentMethod === "credit_card" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="cardNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Card Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0000 0000 0000 0000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="expiry"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Expiry (MM/YY)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="12/25" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="cvc"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>CVC</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="123" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "upi" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <FormField
                                            control={form.control}
                                            name="upiId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>UPI ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="username@upi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            A payment request will be sent to your UPI app.
                                        </p>
                                    </div>
                                )}

                                {paymentMethod === "cod" && (
                                    <div className="rounded-md bg-muted p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <p className="text-sm text-muted-foreground">
                                            Pay with cash when your order is delivered. Please ensure you have the exact amount.
                                        </p>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay ₹${total.toFixed(2)}`
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.title} (x{item.quantity})</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { CheckoutForm } from './CheckoutForm';

export default function CheckoutPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
            <CheckoutForm />
        </div>
    );
}

import { NewListingForm } from './components/NewListingForm';

export default function NewListingPage() {
    return (
        <div className="container mx-auto max-w-2xl py-8">
            <h1 className="text-3xl font-bold font-headline mb-6 text-center">Create a New Listing</h1>
            <NewListingForm />
        </div>
    );
}
